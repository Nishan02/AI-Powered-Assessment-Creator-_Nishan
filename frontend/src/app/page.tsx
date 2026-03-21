'use client';

import { useEffect, useState } from 'react';
import { Bell, ArrowLeft, LogOut } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import EmptyState from '@/components/EmptyState';
import AssignmentForm from '@/components/AssignmentForm';
import AssignmentListener from '@/components/AssignmentListener';
import OutputPaper from '@/components/OutputPaper';
import AssignmentList from '@/components/AssignmentList';
import Auth from '@/components/Auth';
import { useAssignmentStore } from '@/store/useAssignmentStore';

export default function DashboardPage() {
  // Grab the auth variables from the store
  const { 
    view, setView, setAssignments, assignments, isAuthenticated, 
    userName, logout, isGuest, ownerId, guestAssignmentIds, clearGuestAssignments
  } = useAssignmentStore();
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only fetch if authenticated
    if (!isAuthenticated) return;
    setIsLoading(true);

    if (!ownerId) {
      setAssignments([]);
      setView('empty');
      setIsLoading(false);
      return;
    }

    const fetchAssignments = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/assignments?ownerId=${encodeURIComponent(ownerId)}`);
        if (!res.ok) throw new Error('Failed to fetch assignments');
        const data = await res.json();
        setAssignments(data);
        if (data.length > 0) {
          setView('list');
        } else {
          setView('empty');
        }
      } catch (error) {
        console.error("Failed to fetch assignments", error);
        setView('empty');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [setAssignments, setView, isAuthenticated, ownerId]);

  // Clean up guest data upon logout
  const handleLogout = async () => {
    if (isGuest && guestAssignmentIds.length > 0) {
      setIsLoading(true);
      try {
        await Promise.all(
          guestAssignmentIds.map(id =>
            fetch(`http://localhost:5000/api/assignments/${id}?ownerId=${encodeURIComponent(ownerId)}`, { method: 'DELETE' })
          )
        );
        clearGuestAssignments();
      } catch (error) {
        console.error("Failed to clean up guest data", error);
      }
      setIsLoading(false);
    }
    logout();
  };

  // --- SHOW AUTH PAGE IF NOT LOGGED IN ---
  if (!isAuthenticated) {
    return <Auth />;
  }

  // --- SHOW DASHBOARD IF LOGGED IN ---
  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden print:h-auto print:overflow-visible print:bg-white">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden print:h-auto print:overflow-visible">
        
        <header className="h-16 bg-white/50 backdrop-blur-sm border-b border-gray-200 flex items-center justify-between px-6 shrink-0 print:hidden z-30">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => assignments.length > 0 ? setView('list') : setView('empty')}
              className="p-1 hover:bg-gray-100 rounded-md text-gray-600 transition-colors"
            >
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
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} alt="User" />
              </div>
              <span className="text-sm font-medium text-gray-700">{userName}</span>
            </div>

            {/* Logout Button calling the new handler */}
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors ml-2" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative p-8 print:p-0 print:overflow-visible">
          <AssignmentListener />
          
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          )}
          
          {!isLoading && view === 'empty' && <EmptyState />}
          {!isLoading && view === 'list' && <AssignmentList />}
          {view === 'form' && <div className="pb-20"><AssignmentForm /></div>}
          
          {view === 'completed' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <OutputPaper />
              <div className="text-center mt-6">
                <button 
                  onClick={() => setView('list')} 
                  className="text-sm font-semibold text-gray-500 hover:text-gray-900 underline print-hidden"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
