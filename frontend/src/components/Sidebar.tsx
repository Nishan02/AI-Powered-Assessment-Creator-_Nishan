'use client';

import { Home, Users, FileText, Wrench, Library, Settings, Plus } from 'lucide-react';
import { useAssignmentStore } from '@/store/useAssignmentStore';

export default function Sidebar() {
  const setView = useAssignmentStore((state) => state.setView);
  const schoolName = useAssignmentStore((state) => state.schoolName);

  return (
    <><aside className="w-[280px] h-screen bg-white border-r border-gray-200 flex flex-col justify-between p-4 hidden md:flex shrink-0 print:hidden">

      {/* Top Section */}
      <div>
        {/* Logo Area */}
        <div className="flex items-center gap-2 px-2 mb-8">
          <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center text-white font-bold text-xl">
            V
          </div>
          <span className="font-bold text-xl text-gray-800">VedaAI</span>
        </div>

        {/* Create Button */}
        <button
          onClick={() => setView('form')}
          className="w-full bg-[#1e1e1e] hover:bg-black text-white rounded-full py-3 px-4 flex items-center justify-center gap-2 font-medium transition-colors mb-8 shadow-sm border border-gray-600"
        >
          <Plus size={18} />
          <span>Create Assignment</span>
        </button>

        {/* Navigation Links */}
        <nav className="space-y-1">
          <NavItem icon={<Home size={20} />} label="Home" />
          <NavItem icon={<Users size={20} />} label="My Groups" />
          <NavItem icon={<FileText size={20} />} label="Assignments" active />
          <NavItem icon={<Wrench size={20} />} label="AI Teacher's Toolkit" />
          <NavItem icon={<Library size={20} />} label="My Library" />
        </nav>
      </div>

      {/* Bottom Section */}
      <div>
        <nav className="mb-4">
          <NavItem icon={<Settings size={20} />} label="Settings" />
        </nav>

        {/* Profile Card */}
        <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3 border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-orange-100 overflow-hidden flex shrink-0">
            {/* Placeholder for Avatar */}
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-gray-800 truncate">Delhi Public School</span>
            <span className="text-xs text-gray-500 truncate">Bokaro Steel City</span>
          </div>
        </div>
      </div>
    </aside><div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3 border border-gray-100">
        <div className="w-10 h-10 rounded-full bg-orange-100 overflow-hidden flex shrink-0">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
        </div>
        <div className="flex flex-col overflow-hidden">
          {/* 3. Render it here */}
          <span className="text-sm font-bold text-gray-900 truncate">{schoolName}</span>
          <span className="text-xs text-gray-500 truncate">Teacher Portal</span>
        </div>
      </div></>

  );
}

// Reusable Nav Item Component
function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <a href="#" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
      {icon}
      {label}
    </a>
  );
}
