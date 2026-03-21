'use client';

import { useState } from 'react';
import { Search, Filter, MoreVertical, Plus } from 'lucide-react';
import { useAssignmentStore } from '@/store/useAssignmentStore';

export default function AssignmentList() {
  const { assignments, setView, setGeneratedPaper, removeAssignment, ownerId } = useAssignmentStore();
  
  // State for Search and Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
  };

  const handleView = (assignment: any) => {
    if (assignment.status === 'completed' && assignment.sections) {
      setGeneratedPaper(assignment);
      setView('completed');
    } else {
      alert('This assignment is still processing or failed.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    if (!ownerId) {
      alert('Session error. Please log in again.');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/assignments/${id}?ownerId=${encodeURIComponent(ownerId)}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        removeAssignment(id); // Instantly removes it from the UI
      } else {
        alert('Failed to delete assignment');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('An error occurred while deleting.');
    }
  };

  // 1. Filter by Search Query
  // 2. Sort by Date
  const filteredAndSortedAssignments = assignments
    .filter((assignment) => 
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col relative pb-24">
      
      {/* Header section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          Assignments <span className="bg-orange-100 text-orange-600 text-xs py-0.5 px-2 rounded-full">{filteredAndSortedAssignments.length}</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage and create assignments for your classes.</p>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
          className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:bg-gray-50 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm transition-colors"
        >
          <Filter size={16} />
          {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
        </button>

        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search Assignment..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gray-200 text-gray-900 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Grid of Cards */}
      {filteredAndSortedAssignments.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">No assignments found matching "{searchQuery}"</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto pr-2 pb-10">
          {filteredAndSortedAssignments.map((assignment) => (
            <div key={assignment._id} className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex justify-between group">
              <div className="flex flex-col justify-between h-full">
                <h3 className="font-bold text-lg text-gray-900 mb-8">{assignment.title}</h3>
                <div className="flex gap-6 text-xs text-gray-500 font-semibold">
                  <span>Assigned on: {formatDate(assignment.createdAt)}</span>
                  <span>Due: {formatDate(assignment.dueDate)}</span>
                </div>
              </div>
              
              {/* 3 Dot Menu */}
              <div className="relative cursor-pointer text-gray-400 hover:text-gray-900">
                <MoreVertical size={20} />
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-6 w-40 bg-white border border-gray-100 shadow-lg rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-10">
                  <button 
                    onClick={() => handleView(assignment)}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
                  >
                    View Assignment
                  </button>
                  <div className="border-t border-gray-100"></div>
                  <button 
                    onClick={() => handleDelete(assignment._id)}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Create Button */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <button 
          onClick={() => setView('form')}
          className="bg-[#1e1e1e] hover:bg-black text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg transition-transform hover:scale-105 text-sm font-semibold"
        >
          <Plus size={18} />
          Create Assignment
        </button>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f8f9fa] to-transparent pointer-events-none z-10"></div>
    </div>
  );
}
