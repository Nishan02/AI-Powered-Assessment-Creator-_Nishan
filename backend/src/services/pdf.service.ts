import fs from 'fs';
import { PDFParse } from 'pdf-parse';

export const extractTextFromPDF = async (filePath: string): Promise<string> => {
  let parser: PDFParse | null = null;

  try {
    const dataBuffer = fs.readFileSync(filePath);
    parser = new PDFParse({ data: dataBuffer });
    const data = await parser.getText();
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to parse PDF file');
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
};
