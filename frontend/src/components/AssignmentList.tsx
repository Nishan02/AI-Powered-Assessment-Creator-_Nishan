'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Filter, MoreVertical, Plus, ChevronDown } from 'lucide-react';
import { useAssignmentStore } from '@/store/useAssignmentStore';

interface Assignment {
  _id: string;
  title: string;
  createdAt: string;
  dueDate: string;
  status: string;
  sections?: unknown[];
}

export default function AssignmentList() {
  const { assignments, setView, setGeneratedPaper, removeAssignment, ownerId } = useAssignmentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
  };

  const filteredAndSortedAssignments = useMemo(() => {
    return (assignments as Assignment[])
      .filter((assignment) => assignment.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [assignments, searchQuery, sortOrder]);

  const handleView = (assignment: Assignment) => {
    if (assignment.status === 'completed' && assignment.sections) {
      setGeneratedPaper(assignment);
      setView('completed');
    } else {
      alert('This assignment is still processing or failed.');
    }
    setOpenMenuId(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    if (!ownerId) {
      alert('Session error. Please log in again.');
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/assignments/${id}?ownerId=${encodeURIComponent(ownerId)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        removeAssignment(id);
      } else {
        alert('Failed to delete assignment');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('An error occurred while deleting.');
    } finally {
      setOpenMenuId(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!sortMenuRef.current) return;
      if (!sortMenuRef.current.contains(event.target as Node)) {
        setIsSortMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full h-full flex flex-col relative pb-20 md:pb-4">
      <div className="px-2 mb-2 hidden md:block">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
          <h1 className="text-[32px] leading-none font-bold text-gray-900">Assignments</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">Manage and create assignments for your classes.</p>
      </div>

      <div className="h-14 bg-white/75 rounded-2xl border border-[#e5e7eb] px-4 mb-3 flex items-center justify-between gap-3">
        <div className="relative flex items-center" ref={sortMenuRef}>
          <button
            type="button"
            onClick={() => setIsSortMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 text-[16px] font-medium text-gray-400 hover:text-gray-700 transition-colors"
          >
            <Filter size={16} />
            <span>Filter By</span>
            <ChevronDown size={14} />
          </button>

          {isSortMenuOpen && (
            <div className="absolute top-9 left-0 z-30 w-44 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  setSortOrder('newest');
                  setIsSortMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 text-sm ${
                  sortOrder === 'newest' ? 'bg-gray-50 text-gray-900 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Newest First
              </button>
              <button
                type="button"
                onClick={() => {
                  setSortOrder('oldest');
                  setIsSortMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 text-sm ${
                  sortOrder === 'oldest' ? 'bg-gray-50 text-gray-900 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Oldest First
              </button>
            </div>
          )}
        </div>

        <div className="relative w-[360px] max-w-[58%]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search Assignment"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-gray-300 text-gray-900"
          />
        </div>
      </div>

      {filteredAndSortedAssignments.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">No assignments found matching "{searchQuery}"</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 overflow-y-auto pr-0 pb-8">
          {filteredAndSortedAssignments.map((assignment) => (
            <div key={assignment._id} className="relative bg-white border border-gray-200 px-5 py-4 rounded-2xl min-h-[138px] shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-[22px] leading-[1.15] text-gray-900">{assignment.title}</h3>
                <button
                  type="button"
                  onClick={() => setOpenMenuId(openMenuId === assignment._id ? null : assignment._id)}
                  className="p-1 text-gray-400 hover:text-gray-900"
                >
                  <MoreVertical size={18} />
                </button>
              </div>

              <div className="flex justify-between gap-3 text-xs text-gray-600 font-semibold mt-8">
                <span>Assigned on: {formatDate(assignment.createdAt)}</span>
                <span>Due: {formatDate(assignment.dueDate)}</span>
              </div>

              {openMenuId === assignment._id && (
                <div className="absolute right-5 top-12 w-40 bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden z-20">
                  <button
                    onClick={() => handleView(assignment)}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
                  >
                    View Assignment
                  </button>
                  <div className="border-t border-gray-100"></div>
                  <button
                    onClick={() => handleDelete(assignment._id)}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="hidden md:block absolute bottom-3 left-1/2 -translate-x-1/2 z-20">
        <button
          onClick={() => setView('form')}
          className="bg-black hover:bg-zinc-900 text-white px-6 py-2.5 rounded-full flex items-center gap-2 shadow-lg text-sm font-semibold"
        >
          <Plus size={15} />
          Create Assignment
        </button>
      </div>
    </div>
  );
}
