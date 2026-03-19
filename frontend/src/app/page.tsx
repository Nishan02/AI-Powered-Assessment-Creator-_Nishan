'use client';

import { Bell, ArrowLeft } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import EmptyState from '@/components/EmptyState';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import AssignmentForm from '@/components/AssignmentForm';
import AssignmentListener from '@/components/AssignmentListener';


export default function DashboardPage() {
  const { view, setView } = useAssignmentStore();

  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white/50 backdrop-blur-sm border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2">
            <button className="p-1 hover:bg-gray-100 rounded-md text-gray-600 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <span className="font-semibold text-gray-800 text-sm">Assignment</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 pr-3 rounded-full transition-colors border border-transparent hover:border-gray-200">
              <div className="w-8 h-8 rounded-full bg-blue-100 overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" alt="User" />
              </div>
              <span className="text-sm font-medium text-gray-700">John Doe</span>
            </div>
          </div>
        </header>

        {/* Dynamic Content Body */}
        {/* Dynamic Content Body */}
        <main className="flex-1 overflow-y-auto relative p-8">
          <AssignmentListener />
          
          {view === 'empty' && <EmptyState />}
          
          {view === 'form' && (
            <div className="pb-20">
              <AssignmentForm />
              <div className="text-center mt-6">
                <button onClick={() => setView('empty')} className="text-sm text-gray-500 hover:text-gray-800 underline">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {view === 'completed' && (
            <div className="text-center mt-20">
              <h2 className="text-3xl font-bold text-green-600">Success! Paper Generated.</h2>
              <p className="mt-2 text-gray-600">The beautiful output paper is coming next.</p>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}