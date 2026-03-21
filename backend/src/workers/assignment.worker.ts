import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
import Assignment from '../models/Assignment';
import { extractTextFromPDF } from '../services/pdf.service';
import { generateAssessment } from '../services/ai.service';
import { io } from '../index'; // Import the WebSocket server to emit events
import fs from 'fs';

dotenv.config();

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null
});

export const assignmentWorker = new Worker(
  'assignment-generation',
  async (job: Job) => {
    const { assignmentId, fileUrl, ...assignmentDetails } = job.data;
    console.log(`\n📋 Processing job ${job.id} for assignment ${assignmentId}`);

    try {
      // 1. Update status to processing
      console.log(`🔄 Updating assignment status to 'processing'...`);
      await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' });
      io.to(assignmentId).emit('status-update', { status: 'processing' });

      // 2. Extract text if a file was uploaded
      let contextText = '';
      if (fileUrl && fs.existsSync(fileUrl)) {
        console.log(`📄 Extracting text from PDF: ${fileUrl}`);
        contextText = await extractTextFromPDF(fileUrl);
        console.log(`✅ Extracted ${contextText.length} characters from PDF`);
      }

      // 3. Call Gemini API
      console.log(`🤖 Calling Gemini API to generate questions...`);
      const aiResponse = await generateAssessment(assignmentDetails, contextText);
      console.log(`✅ AI generated ${aiResponse.sections?.length || 0} sections`);

      // 4. Update Database with the structured sections
      console.log(`💾 Saving generated content to database...`);
      const updatedAssignment = await Assignment.findByIdAndUpdate(
        assignmentId,
        {
          status: 'completed',
          sections: aiResponse.sections,
          duration: aiResponse.duration,
        },
        { new: true }
      );

      // 5. Notify Frontend via WebSocket
      console.log(`📍 Emitting 'generation-complete' event to room: ${assignmentId}`);
      const socketRooms = io.sockets.adapter.rooms.get(assignmentId);
      console.log(`🔌 Active connections in room '${assignmentId}': ${socketRooms?.size || 0}`);
      
      io.to(assignmentId).emit('generation-complete', updatedAssignment);
      
      console.log(`✅ Job ${job.id} completed successfully!\n`);
      return updatedAssignment;

    } catch (error) {
      console.error(`\n❌ Job ${job.id} failed:`, error);
      
      // Extract meaningful error message
      let errorMessage = 'Failed to generate assessment';
      if (error instanceof Error) {
        const errorStr = error.message || error.toString();
        if (errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('Quota exceeded')) {
          errorMessage = 'AI generation limit reached. Please wait a few hours before trying again.';
        } else if (errorStr.includes('API key') || errorStr.includes('authentication')) {
          errorMessage = 'API authentication error. Please contact support.';
        } else {
          errorMessage = errorStr;
        }
      }
      
      // Handle failure state
      await Assignment.findByIdAndUpdate(assignmentId, { status: 'failed' });
      console.log(`📍 Emitting 'generation-failed' event to room: ${assignmentId}`);
      io.to(assignmentId).emit('generation-failed', { error: errorMessage });
      
      throw error;
    }
  },
  { connection }
);

// Listeners for debugging
assignmentWorker.on('completed', (job) => console.log(`✅ Worker completed job ${job.id}`));
assignmentWorker.on('failed', (job, err) => console.error(`❌ Worker failed job ${job?.id}:`, err.message));