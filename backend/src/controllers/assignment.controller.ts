import { Request, Response } from 'express';
import Assignment from '../models/Assignment';
import { assignmentQueue } from '../config/queue';

export const createAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ownerId, title, className, dueDate, questionTypes, totalQuestions, totalMarks, additionalInstructions } = req.body;
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
      className,
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
      className: savedAssignment.className,
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
    console.error('Error creating assignment:', error instanceof Error ? error.message : error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
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
    console.error('Error fetching assignments:', error instanceof Error ? error.message : error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
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

export const regenerateAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(`🔄 Regenerating assignment: ${id}`);

    // Find the assignment to regenerate
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      console.error(`❌ Assignment not found: ${id}`);
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    console.log(`✅ Found assignment: ${id}, resetting status...`);

    // Reset the assignment status for re-generation
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      id,
      { status: 'pending', sections: [] },
      { new: true }
    );

    if (!updatedAssignment) {
      console.error(`❌ Failed to update assignment: ${id}`);
      res.status(500).json({ error: 'Failed to update assignment' });
      return;
    }

    console.log(`📍 Queueing regeneration job for: ${id}`);

    // Re-queue the generation job with same parameters
    await assignmentQueue.add('generate-questions', {
      assignmentId: updatedAssignment._id,
      fileUrl: updatedAssignment.fileUrl,
      title: updatedAssignment.title,
      className: updatedAssignment.className,
      questionTypes: updatedAssignment.questionTypes,
      totalQuestions: updatedAssignment.totalQuestions,
      totalMarks: updatedAssignment.totalMarks,
      additionalInstructions: updatedAssignment.additionalInstructions
    });

    console.log(`✅ Regeneration job queued: ${id}`);

    // Return immediate response
    res.status(202).json({
      message: 'Assignment queued for regeneration',
      assignmentId: id
    });

  } catch (error) {
    console.error('❌ Error regenerating assignment:', error instanceof Error ? error.message : error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
};
