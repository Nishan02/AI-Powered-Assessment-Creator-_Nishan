import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Connect to Redis with timeout and retry settings
const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
	maxRetriesPerRequest: null,
	connectTimeout: 10000, // 10 seconds
	retryStrategy: (times) => {
		const delay = Math.min(times * 50, 2000);
		console.log(`Redis connection attempt ${times}, retrying in ${delay}ms...`);
		return delay;
	},
	lazyConnect: false
});

connection.on('error', (err) => {
	console.error('Redis connection error:', err.message);
	console.warn('⚠️  Redis is not available. Make sure Redis is running or check your REDIS_URL in .env');
});

connection.on('connect', () => {
	console.log('✅ Redis connected successfully');
});

// Initialize the queue
export const assignmentQueue = new Queue('assignment-generation', { connection });

console.log('BullMQ Queue initialized');