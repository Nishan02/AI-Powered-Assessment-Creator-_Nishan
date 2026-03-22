import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

type GeneratedQuestion = {
  text?: string;
  options?: string[];
  difficulty?: string;
  marks?: number;
  answer?: string;
};

type GeneratedSection = {
  title?: string;
  instruction?: string;
  questions?: GeneratedQuestion[];
};

type GeneratedAssessment = {
  duration?: string;
  sections?: GeneratedSection[];
};

const hasAnswer = (question: GeneratedQuestion): boolean =>
  typeof question.answer === 'string' && question.answer.trim().length > 0;

const fillMissingAnswers = async (
  model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>,
  assessment: GeneratedAssessment,
  assignmentDetails: any,
  contextText: string
): Promise<void> => {
  const sections = Array.isArray(assessment.sections) ? assessment.sections : [];
  const missing: Array<{
    id: string;
    sectionIndex: number;
    questionIndex: number;
    text: string;
    options: string[];
  }> = [];

  sections.forEach((section, sectionIndex) => {
    const questions = Array.isArray(section.questions) ? section.questions : [];
    questions.forEach((question, questionIndex) => {
      if (!hasAnswer(question)) {
        missing.push({
          id: `s${sectionIndex}q${questionIndex}`,
          sectionIndex,
          questionIndex,
          text: question.text || '',
          options: Array.isArray(question.options) ? question.options : [],
        });
      }
    });
  });

  if (missing.length === 0) return;

  const trimmedContext = contextText ? contextText.slice(0, 8000) : '';
  const fallbackPrompt = `
    You are generating missing answer keys for an assessment.
    Return ONLY JSON:
    {
      "answers": [
        { "id": "s0q0", "answer": "..." }
      ]
    }

    Rules:
    - Provide a non-empty answer for every id listed.
    - Keep answers concise and correct for class level "${assignmentDetails.className || 'Not specified'}".
    - Stay strictly within topic "${assignmentDetails.title}".
    - If options exist, choose the best correct option and justify briefly in one line.

    Context: ${trimmedContext || 'No extra context provided'}
    Missing Questions: ${JSON.stringify(missing)}
  `;

  try {
    const fallbackResult = await model.generateContent(fallbackPrompt);
    const fallbackText = fallbackResult.response.text();
    const parsed = JSON.parse(fallbackText) as { answers?: Array<{ id?: string; answer?: string }> };
    const answerMap = new Map<string, string>();

    (parsed.answers || []).forEach((item) => {
      if (item.id && typeof item.answer === 'string' && item.answer.trim()) {
        answerMap.set(item.id, item.answer.trim());
      }
    });

    missing.forEach(({ id, sectionIndex, questionIndex }) => {
      const answer = answerMap.get(id);
      if (!answer) return;
      const question = assessment.sections?.[sectionIndex]?.questions?.[questionIndex];
      if (question) question.answer = answer;
    });
  } catch (error) {
    console.warn('Failed to auto-fill missing answers:', error instanceof Error ? error.message : error);
  }

  // Final safety: never leave an empty answer key entry.
  missing.forEach(({ sectionIndex, questionIndex }) => {
    const question = assessment.sections?.[sectionIndex]?.questions?.[questionIndex];
    if (!question) return;
    if (!hasAnswer(question)) {
      question.answer = 'Model answer unavailable for this question.';
    }
  });
};

export const generateAssessment = async (
  assignmentDetails: any,
  contextText: string = ''
) => {
  // Using gemini-1.5-pro or flash. Both support JSON mode natively.
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json', // This guarantees a JSON response
    },
  });

  const hasContext = Boolean(contextText?.trim());
  const syllabusConstraint = hasContext
    ? `
    STRICT SYLLABUS BOUNDARY:
    - Use only the provided Context/Source Material to create questions.
    - Do not introduce topics that are not present in the source material.
    - If source text is noisy, still stay anchored to the assignment title, class, and instructions.
    - Never switch to unrelated domains (for example: astronomy for a DSA assignment).
    `
    : `
    STRICT TOPIC BOUNDARY:
    - Keep every question strictly within this assignment topic: "${assignmentDetails.title}".
    - Follow class level and instructions; do not introduce unrelated subjects.
    `;

  const prompt = `
    You are an expert educational assessment creator.
    Generate a highly structured question paper based on the following requirements:
    
    Context/Source Material: ${contextText || 'General knowledge based on the topics.'}
    Title: ${assignmentDetails.title}
    Class: ${assignmentDetails.className || 'Not specified'}
    Question Types: ${assignmentDetails.questionTypes.join(', ')}
    Total Questions: ${assignmentDetails.totalQuestions}
    Total Marks: ${assignmentDetails.totalMarks}
    Additional Instructions: ${assignmentDetails.additionalInstructions || 'None'}
    ${syllabusConstraint}

    Distribute the total questions and total marks logically across different sections (e.g., Section A, Section B).
    Assign a difficulty level ('Easy', 'Moderate', 'Hard') to each question.
    Every question MUST include a non-empty "answer" field.

    You must respond ONLY with a valid JSON object matching this exact structure:
    {
      "duration": "String (Extract the time limit from the instructions, e.g., '3 Hours'. If not mentioned, default to '1 Hour')",
      "sections": [
        {
          "title": "String (e.g., 'Section A: Multiple Choice')",
          "instruction": "String (e.g., 'Attempt all questions in this section.')",
          "questions": [
            {
              "text": "String (The actual question)",
              "options": ["String", "String", "String", "String"],
              "difficulty": "String (Must be exactly 'Easy', 'Moderate', or 'Hard')",
              "marks": Number,
              "answer": "String (A clear model answer for the question. Keep concise but complete.)"
            }
          ]
        }
      ]
    }
  `;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  const parsed = JSON.parse(responseText) as GeneratedAssessment;

  await fillMissingAnswers(model, parsed, assignmentDetails, contextText);
  return parsed;
};
