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

  const prompt = `
    You are an expert educational assessment creator.
    Generate a highly structured question paper based on the following requirements:
    
    Context/Source Material: ${contextText || 'General knowledge based on the topics.'}
    Title: ${assignmentDetails.title}
    Question Types: ${assignmentDetails.questionTypes.join(', ')}
    Total Questions: ${assignmentDetails.totalQuestions}
    Total Marks: ${assignmentDetails.totalMarks}
    Additional Instructions: ${assignmentDetails.additionalInstructions || 'None'}

    Distribute the total questions and total marks logically across different sections (e.g., Section A, Section B).
    Assign a difficulty level ('Easy', 'Moderate', 'Hard') to each question.

    You must respond ONLY with a valid JSON object matching this exact structure:
    {
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