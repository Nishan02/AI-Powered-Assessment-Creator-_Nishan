'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAssignmentStore } from '@/store/useAssignmentStore';

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    socket = io(API_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }
  return socket;
}

export default function AssignmentListener() {
  const { assignmentId, view, setView, setGeneratedPaper, upsertAssignment } = useAssignmentStore();
  const assignmentIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!assignmentId) return;

    const currentSocket = getSocket();
    assignmentIdRef.current = assignmentId;

    // Wait for socket to be connected before joining room
    const joinRoom = () => {
      currentSocket.emit('join-assignment-room', assignmentId);
      console.log(`📍 Joining assignment room: ${assignmentId}`);
    };

    if (currentSocket.connected) {
      joinRoom();
    } else {
      currentSocket.once('connect', joinRoom);
    }

    // Handle generation complete
    const handleGenerationComplete = (data: any) => {
      console.log('✨ Generation complete:', data);
      if (assignmentIdRef.current === assignmentId) {
        upsertAssignment(data);
        setGeneratedPaper(data);
        setView('completed');
      }
    };

    // Handle generation failed
    const handleGenerationFailed = (error: any) => {
      console.error('❌ Generation failed:', error);
      if (assignmentIdRef.current === assignmentId) {
        setView('failed');
      }
    };

    currentSocket.on('generation-complete', handleGenerationComplete);
    currentSocket.on('generation-failed', handleGenerationFailed);

    return () => {
      currentSocket.off('generation-complete', handleGenerationComplete);
      currentSocket.off('generation-failed', handleGenerationFailed);
    };
  }, [assignmentId, setView, setGeneratedPaper, upsertAssignment]);

  if (view === 'loading') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ width: '64px', height: '64px', border: '4px solid #e5e7eb', borderTop: '4px solid #ea580c', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '24px' }} ></div>
        <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>AI is drafting your assignment...</h3>
        <p style={{ color: '#6b7280', marginTop: '8px' }}>Reading syllabus and generating structured questions.</p>
      </div>
    );
  }

  return null;
}
