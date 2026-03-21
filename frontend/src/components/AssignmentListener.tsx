'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAssignmentStore } from '@/store/useAssignmentStore';

const socket = io('http://localhost:5000');

export default function AssignmentListener() {
  const { assignmentId, view, setView, setGeneratedPaper, upsertAssignment } = useAssignmentStore();

  useEffect(() => {
    if (!assignmentId) return;

    socket.emit('join-assignment-room', assignmentId);

    socket.on('generation-complete', (data) => {
      upsertAssignment(data);
      setGeneratedPaper(data);
      setView('completed'); // Switch to the final output view!
    });

    socket.on('generation-failed', () => {
      setView('failed');
    });

    return () => {
      socket.off('generation-complete');
      socket.off('generation-failed');
    };
  }, [assignmentId, setView, setGeneratedPaper, upsertAssignment]);

  if (view === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mb-6"></div>
        <h3 className="text-2xl font-bold text-gray-800">AI is drafting your assignment...</h3>
        <p className="text-gray-500 mt-2">Reading syllabus and generating structured questions.</p>
      </div>
    );
  }

  return null;
}
