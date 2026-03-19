'use client';

import { useAssignmentStore } from '@/store/useAssignmentStore';
import { Plus } from 'lucide-react';

export default function EmptyState() {
  const setView = useAssignmentStore((state) => state.setView);

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center px-4">
      {/* Illustration Mockup */}
      <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
        <div className="absolute inset-0 bg-gray-100 rounded-full opacity-50 blur-2xl"></div>
        <div className="relative z-10 w-24 h-32 bg-white border-2 border-gray-200 rounded-lg shadow-sm flex flex-col p-3">
          <div className="w-full h-2 bg-gray-200 rounded-full mb-2"></div>
          <div className="w-3/4 h-2 bg-gray-200 rounded-full mb-2"></div>
          <div className="w-5/6 h-2 bg-gray-200 rounded-full"></div>
        </div>
        {/* The Red X Magnifying Glass Mock */}
        <div className="absolute bottom-4 right-4 w-16 h-16 bg-white border-4 border-purple-100 rounded-full shadow-lg flex items-center justify-center z-20">
           <div className="text-red-500 font-bold text-2xl">×</div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-3">No assignments yet</h2>
      <p className="text-sm text-gray-500 mb-8 leading-relaxed">
        Create your first assignment to start collecting and grading student submissions. 
        You can set up rubrics, define marking criteria, and let AI assist with grading.
      </p>

      <button 
        onClick={() => setView('form')}
        className="bg-[#1e1e1e] hover:bg-black text-white rounded-full py-3 px-6 flex items-center justify-center gap-2 font-medium transition-colors shadow-sm"
      >
        <Plus size={18} />
        <span>Create Your First Assignment</span>
      </button>
    </div>
  );
}