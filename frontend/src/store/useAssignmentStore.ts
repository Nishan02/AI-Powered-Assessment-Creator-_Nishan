import { create } from 'zustand';

interface AssignmentState {
  // Navigation State
  view: 'empty' | 'form' | 'loading' | 'completed' | 'failed';
  setView: (view: AssignmentState['view']) => void;

  // Data State
  assignmentId: string | null;
  setAssignmentId: (id: string) => void;
  
  generatedPaper: any | null;
  setGeneratedPaper: (paper: any) => void;
  
  reset: () => void;
}

export const useAssignmentStore = create<AssignmentState>((set) => ({
  view: 'empty', // Start on the 0 State screen
  setView: (view) => set({ view }),
  
  assignmentId: null,
  setAssignmentId: (id) => set({ assignmentId: id }),
  
  generatedPaper: null,
  setGeneratedPaper: (paper) => set({ generatedPaper: paper }),
  
  reset: () => set({ view: 'empty', assignmentId: null, generatedPaper: null }),
}));