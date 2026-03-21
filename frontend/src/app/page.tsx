'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Bell,
  ArrowLeft,
  LogOut,
  Home,
  Users,
  Wrench,
  Library,
  Settings,
  FileText,
  Plus,
  Menu,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import EmptyState from '@/components/EmptyState';
import AssignmentForm from '@/components/AssignmentForm';
import AssignmentListener from '@/components/AssignmentListener';
import OutputPaper from '@/components/OutputPaper';
import AssignmentList from '@/components/AssignmentList';
import Auth from '@/components/Auth';
import { useAssignmentStore } from '@/store/useAssignmentStore';

type SidebarSection = 'home' | 'groups' | 'assignments' | 'toolkit' | 'library' | 'settings';

export default function DashboardPage() {
  const {
    hasHydrated,
    view,
    setView,
    setAssignments,
    assignments,
    isAuthenticated,
    userName,
    logout,
    isGuest,
    ownerId,
    guestAssignmentIds,
    clearGuestAssignments,
    sidebarSection,
    setSidebarSection,
  } = useAssignmentStore();

  const [isLoading, setIsLoading] = useState(true);

  const fetchAssignments = useCallback(
    async ({ showLoader = true, syncView = false }: { showLoader?: boolean; syncView?: boolean } = {}) => {
      if (!ownerId) return;
      if (showLoader) setIsLoading(true);

      try {
        const res = await fetch(`http://localhost:5000/api/assignments?ownerId=${encodeURIComponent(ownerId)}`);
        if (!res.ok) throw new Error('Failed to fetch assignments');
        const data = await res.json();
        setAssignments(data);

        if (syncView) {
          setView(data.length > 0 ? 'list' : 'empty');
        }
      } catch (error) {
        console.error('Failed to fetch assignments', error);
        if (syncView) setView('empty');
      } finally {
        if (showLoader) setIsLoading(false);
      }
    },
    [ownerId, setAssignments, setView]
  );

  useEffect(() => {
    if (!isAuthenticated) return;

    if (!ownerId) {
      setAssignments([]);
      setView('empty');
      setIsLoading(false);
      return;
    }

    fetchAssignments({ showLoader: true, syncView: true });
  }, [setAssignments, setView, isAuthenticated, ownerId, fetchAssignments]);

  useEffect(() => {
    if (!isAuthenticated || !ownerId) return;
    if (sidebarSection !== 'assignments') return;
    if (view !== 'list' && view !== 'empty') return;

    fetchAssignments({ showLoader: false, syncView: false });
  }, [isAuthenticated, ownerId, sidebarSection, view, fetchAssignments]);

  const handleLogout = async () => {
    if (isGuest && guestAssignmentIds.length > 0) {
      setIsLoading(true);
      try {
        await Promise.all(
          guestAssignmentIds.map((id) =>
            fetch(`http://localhost:5000/api/assignments/${id}?ownerId=${encodeURIComponent(ownerId)}`, { method: 'DELETE' })
          )
        );
        clearGuestAssignments();
      } catch (error) {
        console.error('Failed to clean up guest data', error);
      }
      setIsLoading(false);
    }
    logout();
  };

  if (!hasHydrated) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#e9ebef]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Auth />;

  const sectionTitleMap: Record<SidebarSection, string> = {
    home: 'Home',
    groups: 'My Groups',
    assignments: 'Assignments',
    toolkit: "AI Teacher's Toolkit",
    library: 'My Library',
    settings: 'Settings',
  };

  const openAssignments = (targetView?: 'empty' | 'list' | 'form') => {
    setSidebarSection('assignments');
    if (targetView) {
      setView(targetView);
      return;
    }
    setView(assignments.length > 0 ? 'list' : 'empty');
  };

  const handleBack = () => {
    if (sidebarSection !== 'assignments') {
      openAssignments();
      return;
    }
    setView(assignments.length > 0 ? 'list' : 'empty');
  };

  const isAssignmentsSection = sidebarSection === 'assignments';
  const sectionTitle = sectionTitleMap[sidebarSection];

  return (
    <div className="flex h-screen bg-[#e9ebef] overflow-hidden">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <DesktopHeader
          sectionTitle={sectionTitle}
          userName={userName}
          onBack={handleBack}
          onLogout={handleLogout}
        />

        <MobileHeader
          sectionTitle={sectionTitle}
          userName={userName}
          onBack={handleBack}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto relative px-3 py-3 md:px-6 md:py-5 pb-24 md:pb-6">
          {isAssignmentsSection && <AssignmentListener />}

          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          )}

          {!isLoading && !isAssignmentsSection && <SectionPlaceholder section={sidebarSection} />}

          {!isLoading && isAssignmentsSection && view === 'empty' && <EmptyState />}
          {!isLoading && isAssignmentsSection && view === 'list' && <AssignmentList />}
          {isAssignmentsSection && view === 'form' && <AssignmentForm />}
          {isAssignmentsSection && view === 'completed' && (
            <div>
              <OutputPaper />
              <div className="text-center mt-4 mb-10 print:hidden">
                <button
                  onClick={() => setView('list')}
                  className="text-sm font-semibold text-gray-600 hover:text-gray-900 underline"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </main>

        <MobileBottomNav
          current={sidebarSection}
          onSelect={(section) => {
            if (section === 'assignments') {
              openAssignments();
              return;
            }
            setSidebarSection(section);
          }}
        />

        {isAssignmentsSection && view !== 'form' && (
          <button
            type="button"
            onClick={() => openAssignments('form')}
            className="md:hidden fixed bottom-20 right-5 z-30 w-12 h-12 rounded-full bg-white text-orange-500 shadow-lg border border-gray-200 flex items-center justify-center"
            aria-label="Create Assignment"
          >
            <Plus size={22} />
          </button>
        )}
      </div>
    </div>
  );
}

function DesktopHeader({
  sectionTitle,
  userName,
  onBack,
  onLogout,
}: {
  sectionTitle: string;
  userName: string;
  onBack: () => void;
  onLogout: () => void;
}) {
  return (
    <header className="hidden md:flex h-14 bg-white/80 backdrop-blur-sm border-b border-gray-200 items-center justify-between px-5 shrink-0 z-20 rounded-bl-2xl">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-md text-gray-600 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <span className="font-semibold text-gray-800 text-sm">{sectionTitle}</span>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Bell size={18} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-orange-500 rounded-full border border-white"></span>
        </button>

        <div className="flex items-center gap-2 bg-[#f7f7f8] rounded-full px-2 py-1">
          <div className="w-7 h-7 rounded-full bg-blue-100 overflow-hidden">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} alt="User" />
          </div>
          <span className="text-sm font-medium text-gray-700">{userName}</span>
        </div>

        <button onClick={onLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Logout">
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}

function MobileHeader({
  sectionTitle,
  userName,
  onBack,
  onLogout,
}: {
  sectionTitle: string;
  userName: string;
  onBack: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="md:hidden bg-[#f4f5f7] border-b border-gray-200 px-3 pt-2 pb-3">
      <div className="bg-white rounded-2xl px-3 py-2 flex items-center justify-between mb-2">
        <div className="font-bold text-gray-900">VedaAI</div>
        <div className="flex items-center gap-3">
          <Bell size={16} className="text-gray-500" />
          <div className="w-7 h-7 rounded-full bg-blue-100 overflow-hidden">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} alt="User" />
          </div>
          <button onClick={onLogout} className="text-gray-500">
            <Menu size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center relative">
        <button onClick={onBack} className="absolute left-0 p-2 rounded-full hover:bg-gray-200 text-gray-600">
          <ArrowLeft size={18} />
        </button>
        <span className="text-sm font-semibold text-gray-800">{sectionTitle}</span>
      </div>
    </div>
  );
}

function MobileBottomNav({
  current,
  onSelect,
}: {
  current: SidebarSection;
  onSelect: (section: SidebarSection) => void;
}) {
  const items: Array<{ id: SidebarSection; label: string; icon: React.ReactNode }> = [
    { id: 'home', label: 'Home', icon: <Home size={14} /> },
    { id: 'groups', label: 'My Groups', icon: <Users size={14} /> },
    { id: 'assignments', label: 'Assignments', icon: <FileText size={14} /> },
    { id: 'library', label: 'Library', icon: <Library size={14} /> },
    { id: 'toolkit', label: 'AI Toolkit', icon: <Wrench size={14} /> },
  ];

  return (
    <div className="md:hidden fixed bottom-2 left-1/2 -translate-x-1/2 z-30 bg-[#101114] text-white rounded-2xl px-2 py-1.5 w-[94%] max-w-[420px] shadow-xl">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const active = current === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`flex flex-col items-center gap-0.5 py-1 rounded-lg text-[10px] ${
                active ? 'text-white' : 'text-gray-400'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SectionPlaceholder({ section }: { section: SidebarSection }) {
  const sectionMeta = {
    home: {
      icon: <Home size={22} />,
      title: 'Home',
      description: 'Your classroom dashboard widgets will appear here.',
    },
    groups: {
      icon: <Users size={22} />,
      title: 'My Groups',
      description: 'Group management and student grouping tools will appear here.',
    },
    assignments: {
      icon: <FileText size={22} />,
      title: 'Assignments',
      description: 'Assignments section.',
    },
    toolkit: {
      icon: <Wrench size={22} />,
      title: "AI Teacher's Toolkit",
      description: 'AI teaching assistants and quick tools will appear here.',
    },
    library: {
      icon: <Library size={22} />,
      title: 'My Library',
      description: 'Saved resources and reusable templates will appear here.',
    },
    settings: {
      icon: <Settings size={22} />,
      title: 'Settings',
      description: 'Account preferences and configuration options will appear here.',
    },
  };

  const item = sectionMeta[section];
  return (
    <div className="h-full flex items-center justify-center">
      <div className="max-w-lg w-full bg-white border border-gray-200 rounded-3xl p-6 md:p-8 text-center shadow-sm">
        <div className="w-12 h-12 mx-auto rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center mb-4">
          {item.icon}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
      </div>
    </div>
  );
}
