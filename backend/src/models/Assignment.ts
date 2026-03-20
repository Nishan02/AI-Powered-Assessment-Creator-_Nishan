import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  text: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  marks: number;
  options?: string[];
}

export interface ISection {
  title: string; // e.g., "Section A"
  instruction: string; // e.g., "Attempt all questions"
  questions: IQuestion[];
}

export interface IAssignment extends Document {
  title: string;
  dueDate: Date;
  questionTypes: string[];
  totalQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
  fileUrl?: string; // If you choose to store the uploaded file
  status: 'pending' | 'processing' | 'completed' | 'failed';
  sections?: ISection[]; // Populated once AI generation is complete
  createdAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Moderate', 'Challenging'], required: true },
  marks: { type: Number, required: true },
  options: [{ type: String }]
});

const SectionSchema = new Schema<ISection>({
  title: { type: String, required: true },
  instruction: { type: String, required: true },
  questions: [QuestionSchema]
});

const AssignmentSchema = new Schema<IAssignment>({
  title: { type: String, required: true },
  dueDate: { type: Date, required: true },
  questionTypes: [{ type: String }],
  totalQuestions: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  additionalInstructions: { type: String },
  fileUrl: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'], 
    default: 'pending' 
  },
  sections: [SectionSchema],
}, { timestamps: true });

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);