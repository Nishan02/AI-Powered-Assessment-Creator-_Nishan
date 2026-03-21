import { create } from 'zustand';

interface AssignmentState {
  // --- AUTH STATE ---
  isAuthenticated: boolean;
  schoolName: string;
  userName: string;
  userEmail: string;
  ownerId: string;
  isGuest: boolean;
  guestAssignmentIds: string[];
  
  login: (userName: string, schoolName: string, isGuest?: boolean, email?: string) => void;
  logout: () => void;
  addGuestAssignmentId: (id: string) => void;
  clearGuestAssignments: () => void;

  // --- EXISTING STATE ---
  view: 'empty' | 'list' | 'form' | 'loading' | 'completed' | 'failed';
  setView: (view: AssignmentState['view']) => void;
  assignmentId: string | null;
  setAssignmentId: (id: string) => void;
  generatedPaper: any | null;
  setGeneratedPaper: (paper: any) => void;
  assignments: any[];
  setAssignments: (assignments: any[]) => void;
  removeAssignment: (id: string) => void;
  reset: () => void;
}

export const useAssignmentStore = create<AssignmentState>((set) => ({
  isAuthenticated: false,
  schoolName: '',
  userName: '',
  userEmail: '',
  ownerId: '',
  isGuest: false,
  guestAssignmentIds: [],
  
  login: (userName, schoolName, isGuest = false, email = '') => {
    const normalizedEmail = email.trim().toLowerCase();
    const ownerId = isGuest
      ? `guest:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`
      : `user:${normalizedEmail || userName.trim().toLowerCase()}`;

    set({
      isAuthenticated: true,
      userName,
      schoolName,
      userEmail: normalizedEmail,
      ownerId,
      isGuest,
      view: 'list',
      assignmentId: null,
      generatedPaper: null,
      assignments: [],
      guestAssignmentIds: [],
    });
  },
  
  logout: () => 
    set({
      isAuthenticated: false,
      schoolName: '',
      userName: '',
      userEmail: '',
      ownerId: '',
      isGuest: false,
      guestAssignmentIds: [],
      view: 'list',
      assignmentId: null,
      generatedPaper: null,
      assignments: [],
    }),
    
  addGuestAssignmentId: (id) => 
    set((state) => ({ guestAssignmentIds: [...state.guestAssignmentIds, id] })),
    
  clearGuestAssignments: () => 
    set({ guestAssignmentIds: [] }),

  view: 'list',
  setView: (view) => set({ view }),
  assignmentId: null,
  setAssignmentId: (id) => set({ assignmentId: id }),
  generatedPaper: null,
  setGeneratedPaper: (paper) => set({ generatedPaper: paper }),
  assignments: [],
  setAssignments: (assignments) => set({ assignments }),
  removeAssignment: (id) => set((state) => ({ 
    assignments: state.assignments.filter(a => a._id !== id) 
  })),
  reset: () => set({ view: 'list', assignmentId: null, generatedPaper: null }),
}));
