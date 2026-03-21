'use client';

import { Home, Users, FileText, Wrench, Library, Settings, Sparkles } from 'lucide-react';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import BrandLogo from '@/components/BrandLogo';

type SidebarSection = 'home' | 'groups' | 'assignments' | 'toolkit' | 'library' | 'settings';

const NAV_ITEMS: Array<{ id: SidebarSection; label: string; icon: React.ReactNode }> = [
  { id: 'home', label: 'Home', icon: <Home size={19} /> },
  { id: 'groups', label: 'My Groups', icon: <Users size={19} /> },
  { id: 'assignments', label: 'Assignments', icon: <FileText size={19} /> },
  { id: 'toolkit', label: "AI Teacher's Toolkit", icon: <Wrench size={19} /> },
  { id: 'library', label: 'My Library', icon: <Library size={19} /> },
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
    <aside className="hidden md:flex w-[304px] h-[calc(100vh-24px)] bg-white rounded-2xl border border-[#e5e7eb] shadow-[0_32px_48px_rgba(0,0,0,0.2)] flex-col justify-between px-6 py-6 shrink-0 print:hidden">
      <div>
        <div className="flex items-center gap-3">
          <BrandLogo size={42} />
          <span className="font-bold text-[40px] leading-none tracking-[-0.02em] text-gray-900">VedaAI</span>
        </div>

        <div className="mt-11 mb-11 rounded-full p-[2px] bg-[linear-gradient(90deg,#fb7f48,#f26b4b)] shadow-[0_6px_14px_rgba(251,127,72,0.45)]">
          <button
            onClick={() => openAssignments('form')}
            className="w-full bg-[radial-gradient(circle_at_30%_0%,#3f4854_0%,#202328_55%,#1a1c20_100%)] hover:bg-black text-white rounded-full py-3 px-4 flex items-center justify-center gap-2 font-medium transition-colors"
          >
            <Sparkles size={14} />
            <span className="text-[17px] leading-none">Create Assignment</span>
          </button>
        </div>

        <nav className="space-y-2">
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

      <div className="pt-2">
        <nav className="mb-6">
          <NavItem
            icon={<Settings size={19} />}
            label="Settings"
            active={sidebarSection === 'settings'}
            onClick={() => handleSectionClick('settings')}
          />
        </nav>

        <div className="bg-[#f3f4f6] rounded-2xl p-3.5 flex items-center gap-3 border border-[#eceef1]">
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
      className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        active ? 'bg-[#f3f4f6] text-gray-900' : 'text-gray-500 hover:bg-[#f7f7f8] hover:text-gray-900'
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
