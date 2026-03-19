import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import assignmentRoutes from './routes/assignment.routes';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize WebSockets
export const io = new Server(server, {
  cors: {
    origin: '*', // We'll tighten this up later if needed
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/assignments', assignmentRoutes);

// Socket Connection handler
io.on('connection', (socket) => {
  console.log('Frontend client connected via WebSocket:', socket.id);
  
  // Optional: Allow clients to join specific rooms based on assignment ID
  socket.on('join-assignment-room', (assignmentId) => {
    socket.join(assignmentId);
    console.log(`Socket ${socket.id} joined room ${assignmentId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start Server & Database
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/veda-ai';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));

import './workers/assignment.worker';