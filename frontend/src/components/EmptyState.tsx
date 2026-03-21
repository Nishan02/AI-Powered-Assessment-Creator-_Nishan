'use client';

import { useAssignmentStore } from '@/store/useAssignmentStore';
import { Plus, FileText, Search } from 'lucide-react';

export default function EmptyState() {
  const setView = useAssignmentStore((state) => state.setView);

  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="max-w-xl text-center px-4">
        <div className="relative w-44 h-44 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute w-36 h-36 rounded-full bg-white/80"></div>
          <div className="relative z-10 w-20 h-28 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col p-3">
            <div className="w-full h-2 bg-gray-200 rounded-full mb-2"></div>
            <div className="w-3/4 h-2 bg-gray-200 rounded-full mb-2"></div>
            <div className="w-5/6 h-2 bg-gray-200 rounded-full"></div>
          </div>
          <div className="absolute top-5 right-5 w-10 h-10 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center">
            <FileText size={16} className="text-gray-400" />
          </div>
          <div className="absolute bottom-6 right-4 w-16 h-16 rounded-full bg-white border-4 border-purple-100 shadow-md flex items-center justify-center">
            <Search size={26} className="text-red-500" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">No assignments yet</h2>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          Create your first assignment to start collecting and grading student submissions.
          You can set up rubrics, define marking criteria, and let AI assist with grading.
        </p>

        <button
          onClick={() => setView('form')}
          className="bg-black hover:bg-zinc-900 text-white rounded-full py-3 px-6 inline-flex items-center justify-center gap-2 font-medium transition-colors shadow-sm"
        >
          <Plus size={16} />
          <span>Create Your First Assignment</span>
        </button>
      </div>
    </div>
  );
}
