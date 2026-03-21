import { Request, Response } from 'express';
import Assignment from '../models/Assignment';
import { assignmentQueue } from '../config/queue';

export const createAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ownerId, title, dueDate, questionTypes, totalQuestions, totalMarks, additionalInstructions } = req.body;
    if (!ownerId || typeof ownerId !== 'string') {
      res.status(400).json({ error: 'ownerId is required' });
      return;
    }
    
    // Check if a file was uploaded
    const fileUrl = req.file ? req.file.path : undefined;

    // 1. Save initial pending state to MongoDB
    const newAssignment = new Assignment({
      ownerId: ownerId.trim(),
      title,
      dueDate,
      questionTypes: JSON.parse(questionTypes || '[]'), // Assuming frontend sends stringified array in FormData
      totalQuestions: Number(totalQuestions),
      totalMarks: Number(totalMarks),
      additionalInstructions,
      fileUrl,
      status: 'pending'
    });

    const savedAssignment = await newAssignment.save();

    // 2. Push job to BullMQ
    await assignmentQueue.add('generate-questions', {
      assignmentId: savedAssignment._id,
      fileUrl: savedAssignment.fileUrl,
      title: savedAssignment.title,
      questionTypes: savedAssignment.questionTypes,
      totalQuestions: savedAssignment.totalQuestions,
      totalMarks: savedAssignment.totalMarks,
      additionalInstructions: savedAssignment.additionalInstructions
    });

    // 3. Return immediate response to frontend
    res.status(202).json({
      message: 'Assignment received and queued for generation',
      assignmentId: savedAssignment._id
    });

  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAssignments = async (req: Request, res: Response): Promise<void> => {
  try {
    const ownerId = typeof req.query.ownerId === 'string' ? req.query.ownerId.trim() : '';
    if (!ownerId) {
      res.status(400).json({ error: 'ownerId query parameter is required' });
      return;
    }

    // Fetch only this owner's assignments, sorted by newest first
    const assignments = await Assignment.find({ ownerId }).sort({ createdAt: -1 });
    res.status(200).json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const ownerId = typeof req.query.ownerId === 'string' ? req.query.ownerId.trim() : '';
    if (!ownerId) {
      res.status(400).json({ error: 'ownerId query parameter is required' });
      return;
    }

    const deletedAssignment = await Assignment.findOneAndDelete({ _id: id, ownerId });
    if (!deletedAssignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    res.status(200).json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
