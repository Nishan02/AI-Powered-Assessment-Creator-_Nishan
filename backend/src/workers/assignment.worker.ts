import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
import Assignment from '../models/Assignment';
import { extractTextFromPDF } from '../services/pdf.service';
import { generateAssessment } from '../services/ai.service';
import { io } from '../index'; // Import the WebSocket server to emit events
import fs from 'fs';

dotenv.config();

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

export const assignmentWorker = new Worker(
  'assignment-generation',
  async (job: Job) => {
    const { assignmentId, fileUrl, ...assignmentDetails } = job.data;
    console.log(`Processing job ${job.id} for assignment ${assignmentId}`);

    try {
      // 1. Update status to processing
      await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' });
      io.to(assignmentId).emit('status-update', { status: 'processing' });

      // 2. Extract text if a file was uploaded
      let contextText = '';
      if (fileUrl && fs.existsSync(fileUrl)) {
        contextText = await extractTextFromPDF(fileUrl);
      }

      // 3. Call Gemini API
      const aiResponse = await generateAssessment(assignmentDetails, contextText);

      // 4. Update Database with the structured sections
      const updatedAssignment = await Assignment.findByIdAndUpdate(
        assignmentId,
        {
          status: 'completed',
          sections: aiResponse.sections,
        },
        { new: true }
      );

      // 5. Notify Frontend via WebSocket
      io.to(assignmentId).emit('generation-complete', updatedAssignment);
      
      console.log(`Job ${job.id} completed successfully!`);
      return updatedAssignment;

    } catch (error) {
      console.error(`Job ${job.id} failed:`, error);
      
      // Handle failure state
      await Assignment.findByIdAndUpdate(assignmentId, { status: 'failed' });
      io.to(assignmentId).emit('generation-failed', { error: 'Failed to generate assessment' });
      
      throw error;
    }
  },
  { connection }
);

// Listeners for debugging
assignmentWorker.on('completed', (job) => console.log(`Worker completed job ${job.id}`));
assignmentWorker.on('failed', (job, err) => console.error(`Worker failed job ${job?.id}:`, err.message));