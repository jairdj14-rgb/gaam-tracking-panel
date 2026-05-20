import { create } from 'zustand';

export const useIncidentsStore = create((set) => ({
  incidents: [],
  unread: 0,

  addIncident: (incident) =>
    set((state) => ({
      incidents: [incident, ...state.incidents],

      unread: state.unread + 1,
    })),

  clearUnread: () =>
    set({
      unread: 0,
    }),
}));
