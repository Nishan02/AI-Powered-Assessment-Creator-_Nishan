'use client';

import { Home, Users, FileText, Wrench, Library, Settings, Plus } from 'lucide-react';
import { useAssignmentStore } from '@/store/useAssignmentStore';

type SidebarSection = 'home' | 'groups' | 'assignments' | 'toolkit' | 'library' | 'settings';

const NAV_ITEMS: Array<{ id: SidebarSection; label: string; icon: React.ReactNode }> = [
  { id: 'home', label: 'Home', icon: <Home size={18} /> },
  { id: 'groups', label: 'My Groups', icon: <Users size={18} /> },
  { id: 'assignments', label: 'Assignments', icon: <FileText size={18} /> },
  { id: 'toolkit', label: "AI Teacher's Toolkit", icon: <Wrench size={18} /> },
  { id: 'library', label: 'My Library', icon: <Library size={18} /> },
];

export default function Sidebar() {
  const {
    assignments,
    schoolName,
    sidebarSection,
    setSidebarSection,
    setView,
  } = useAssignmentStore();
  const assignmentCount = assignments.length;

  const openAssignments = (targetView: 'form' | 'list' | 'empty') => {
    setSidebarSection('assignments');
    setView(targetView);
  };

  const handleSectionClick = (section: SidebarSection) => {
    setSidebarSection(section);
    if (section === 'assignments') {
      setView(assignments.length > 0 ? 'list' : 'empty');
    }
  };

  return (
    <aside className="w-[252px] h-screen bg-[#f5f5f5] border-r border-gray-200 flex flex-col justify-between p-3 hidden md:flex shrink-0 print:hidden">
      <div>
        <div className="flex items-center gap-2 px-2 py-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">
            V
          </div>
          <span className="font-bold text-[31px] leading-none text-gray-900">VedaAI</span>
        </div>

        <button
          onClick={() => openAssignments('form')}
          className="w-full bg-[#18181b] hover:bg-black text-white rounded-full py-3 px-4 flex items-center justify-center gap-2 font-medium transition-colors shadow-sm mb-7 border border-[#fb7f48]"
        >
          <Plus size={18} />
          <span>Create Assignment</span>
        </button>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={sidebarSection === item.id}
              badgeCount={item.id === 'assignments' ? assignmentCount : undefined}
              onClick={() => handleSectionClick(item.id)}
            />
          ))}
        </nav>
      </div>

      <div>
        <nav className="mb-5">
          <NavItem
            icon={<Settings size={18} />}
            label="Settings"
            active={sidebarSection === 'settings'}
            onClick={() => handleSectionClick('settings')}
          />
        </nav>

        <div className="bg-[#eef0f3] rounded-xl p-3 flex items-center gap-3 border border-[#e4e7ec]">
          <div className="w-10 h-10 rounded-full bg-orange-100 overflow-hidden flex shrink-0">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=school-profile" alt="School avatar" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-gray-900 truncate">{schoolName || 'School Profile'}</span>
            <span className="text-xs text-gray-500 truncate">Teacher Portal</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  icon,
  label,
  active = false,
  onClick,
  badgeCount,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  badgeCount?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-white hover:text-gray-900'
      }`}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {typeof badgeCount === 'number' && (
        <span className="text-[10px] font-bold text-white bg-orange-500 rounded-full px-1.5 py-0.5 leading-none min-w-5 text-center">
          {badgeCount}
        </span>
      )}
    </button>
  );
}
