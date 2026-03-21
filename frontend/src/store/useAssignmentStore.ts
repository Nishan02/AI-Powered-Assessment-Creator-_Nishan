import { create } from 'zustand';

interface AssignmentState {
  // Navigation State
  view: 'empty' | 'list' | 'form' | 'loading' | 'completed' | 'failed';
  setView: (view: AssignmentState['view']) => void;

  // Data State
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