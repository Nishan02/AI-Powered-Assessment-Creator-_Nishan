import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AssignmentRecord {
  _id: string;
  [key: string]: any;
}

interface AssignmentState {
  hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;

  sidebarSection: 'home' | 'groups' | 'assignments' | 'toolkit' | 'library' | 'settings';

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
  setSidebarSection: (section: AssignmentState['sidebarSection']) => void;
  setView: (view: AssignmentState['view']) => void;
  assignmentId: string | null;
  setAssignmentId: (id: string) => void;
  generatedPaper: any | null;
  setGeneratedPaper: (paper: any) => void;
  assignments: AssignmentRecord[];
  setAssignments: (assignments: AssignmentRecord[]) => void;
  upsertAssignment: (assignment: AssignmentRecord) => void;
  removeAssignment: (id: string) => void;
  generationError: string | null;
  setGenerationError: (error: string | null) => void;
  reset: () => void;
}

export const useAssignmentStore = create<AssignmentState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),

      sidebarSection: 'assignments',
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
          sidebarSection: 'assignments',
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
          sidebarSection: 'assignments',
          view: 'list',
          assignmentId: null,
          generatedPaper: null,
          assignments: [],
        }),

      addGuestAssignmentId: (id) =>
        set((state) => ({ guestAssignmentIds: [...state.guestAssignmentIds, id] })),

      clearGuestAssignments: () =>
        set({ guestAssignmentIds: [] }),

      setSidebarSection: (sidebarSection) => set({ sidebarSection }),
      view: 'list',
      setView: (view) => set({ view }),
      assignmentId: null,
      setAssignmentId: (id) => set({ assignmentId: id }),
      generatedPaper: null,
      setGeneratedPaper: (paper) => set({ generatedPaper: paper }),
      assignments: [],
      setAssignments: (assignments) => set({ assignments }),
      upsertAssignment: (assignment) =>
        set((state) => {
          const existingIndex = state.assignments.findIndex((a) => a._id === assignment._id);
          if (existingIndex === -1) {
            return { assignments: [assignment, ...state.assignments] };
          }

          const updated = [...state.assignments];
          updated[existingIndex] = { ...updated[existingIndex], ...assignment };
          return { assignments: updated };
        }),
      removeAssignment: (id) =>
        set((state) => ({
          assignments: state.assignments.filter((a) => a._id !== id),
        })),
      generationError: null,
      setGenerationError: (error) => set({ generationError: error }),
      reset: () => set({ view: 'list', assignmentId: null, generatedPaper: null, generationError: null }),
    }),
    {
      name: 'veda-assignment-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        schoolName: state.schoolName,
        userName: state.userName,
        userEmail: state.userEmail,
        ownerId: state.ownerId,
        isGuest: state.isGuest,
        guestAssignmentIds: state.guestAssignmentIds,
        sidebarSection: state.sidebarSection,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
