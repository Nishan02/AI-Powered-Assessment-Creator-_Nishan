import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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
              "marks": Number
            }
          ]
        }
      ]
    }
  `;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  
  return JSON.parse(responseText);
};
