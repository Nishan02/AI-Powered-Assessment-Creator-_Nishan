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
  const { assignmentId, view, setView, setGeneratedPaper, upsertAssignment, setGenerationError } = useAssignmentStore();
  const assignmentIdRef = useRef<string | null>(null);
  const eventHandlersRef = useRef<{ complete?: Function; failed?: Function }>({});

  useEffect(() => {
    // Only run when we're in loading state
    if (view !== 'loading' || !assignmentId) {
      console.log(`⏸️ AssignmentListener paused (view: ${view}, assignmentId: ${assignmentId})`);
      return;
    }

    const currentSocket = getSocket();
    assignmentIdRef.current = assignmentId;

    console.log(`🔄 AssignmentListener: Activating for assignment ${assignmentId}`);

    // Join the room
    const joinRoom = () => {
      console.log(`📍 Emitting join-assignment-room for: ${assignmentId}`);
      currentSocket.emit('join-assignment-room', assignmentId);
    };

    if (currentSocket.connected) {
      joinRoom();
    } else {
      console.log('⚠️ Socket not connected yet, waiting for connection...');
      currentSocket.once('connect', () => {
        console.log('✅ Socket connected, now joining room');
        joinRoom();
      });
    }

    // Handle generation complete
    const handleGenerationComplete = (data: any) => {
      console.log('✨ Generation complete event received:', data);
      if (assignmentIdRef.current === assignmentId) {
        console.log('✅ Updating store with completed assignment');
        upsertAssignment(data);
        setGeneratedPaper(data);
        setView('completed');
      } else {
        console.warn(`⚠️ Assignment ID mismatch: expected ${assignmentId}, got ${assignmentIdRef.current}`);
      }
    };

    // Handle generation failed
    const handleGenerationFailed = (data: any) => {
      const errorMessage = data?.error || 'Failed to generate assignment';
      console.error('❌ Generation failed event received:', errorMessage);
      if (assignmentIdRef.current === assignmentId) {
        setGenerationError(errorMessage);
        setView('failed');
      }
    };

    // Store handlers for cleanup
    eventHandlersRef.current = { complete: handleGenerationComplete, failed: handleGenerationFailed };

    // Register listeners
    currentSocket.on('generation-complete', handleGenerationComplete);
    currentSocket.on('generation-failed', handleGenerationFailed);

    // Log socket status
    console.log(`🔌 Socket status: connected=${currentSocket.connected}, id=${currentSocket.id}`);

    return () => {
      console.log(`🧹 Cleaning up listeners for assignment ${assignmentId}`);
      currentSocket.off('generation-complete', handleGenerationComplete);
      currentSocket.off('generation-failed', handleGenerationFailed);
    };
  }, [assignmentId, view, setView, setGeneratedPaper, upsertAssignment]);

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
