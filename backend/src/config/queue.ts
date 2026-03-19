import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Connect to Redis (Make sure Redis is running on your machine or use a hosted URL)
const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

// Initialize the queue
export const assignmentQueue = new Queue('assignment-generation', { connection });

console.log('BullMQ Queue initialized');