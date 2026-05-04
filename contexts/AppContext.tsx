'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { AppState, AppAction } from '@/lib/types';
import { initialState } from '@/lib/data';

import { ticketService } from '@/lib/services/ticket.service';
import { expenseService } from '@/lib/services/expense.service';
import { meetingService } from '@/lib/services/meeting.service';
import { teamService } from '@/lib/services/team.service';
import { revenueService } from '@/lib/services/revenue.service';

// ─── Reducer ────────────────────────────────────────────────────────────────

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_MEETINGS':
      return { ...state, meetings: action.payload };
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload };
    case 'SET_TICKET_SALES':
      return { ...state, ticketSales: action.payload };
    case 'SET_REVENUES':
      return { ...state, revenues: action.payload };
    case 'SET_TEAM_MEMBERS':
      return { ...state, teamMembers: action.payload };
    case 'ADD_MEETING':
      return { ...state, meetings: [...state.meetings, action.payload] };
    case 'UPDATE_MEETING':
      return {
        ...state,
        meetings: state.meetings.map(m =>
          m.id === action.payload.id ? action.payload : m
        ),
      };
    case 'DELETE_MEETING':
      return {
        ...state,
        meetings: state.meetings.filter(m => m.id !== action.payload),
      };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(e => e.id !== action.payload),
      };
    case 'ADD_TICKET_SALE':
      return { ...state, ticketSales: [...state.ticketSales, action.payload] };
    case 'DELETE_TICKET_SALE':
      return {
        ...state,
        ticketSales: state.ticketSales.filter(t => t.id !== action.payload),
      };
    case 'ADD_REVENUE':
      return { ...state, revenues: [...state.revenues, action.payload] };
    case 'ADD_TEAM_MEMBER':
      return { ...state, teamMembers: [...state.teamMembers, action.payload] };
    case 'UPDATE_TEAM_MEMBER':
      return {
        ...state,
        teamMembers: state.teamMembers.map(m =>
          m.id === action.payload.id ? action.payload : m
        ),
      };
    case 'DELETE_TEAM_MEMBER':
      return {
        ...state,
        teamMembers: state.teamMembers.filter(m => m.id !== action.payload),
      };
    case 'TOGGLE_ACTION':
      return {
        ...state,
        meetings: state.meetings.map(m => {
          if (m.id !== action.payload.meetingId) return m;
          return {
            ...m,
            actions: m.actions.map(a =>
              a.id === action.payload.actionId ? { ...a, completed: !a.completed } : a
            ),
          };
        }),
      };
    case 'MARK_ALERT_READ':
      return {
        ...state,
        alerts: state.alerts.map(a =>
          a.id === action.payload ? { ...a, read: true } : a
        ),
      };
    case 'DISMISS_ALERT':
      return {
        ...state,
        alerts: state.alerts.filter(a => a.id !== action.payload),
      };
    case 'ADD_ALERT':
      return {
        ...state,
        alerts: [action.payload, ...state.alerts],
      };
    case 'UPDATE_EVENT_DATE':
      return {
        ...state,
        eventDate: action.payload,
      };
    case 'UPDATE_BUDGET_TOTAL':
      return {
        ...state,
        budgetTotal: action.payload,
      };
    case 'UPDATE_TICKET_TARGET':
      return {
        ...state,
        ticketTarget: action.payload,
      };
    case 'SYNC_STATE': // Used to replace full state from other tabs
      return action.payload;
    default:
      return state;
}
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = 'alphatech_state';
const EVENT_KEY = 'alphatech_event';

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatchBase] = useReducer(appReducer, initialState);
  const isInitialized = useRef(false);

  // Sync state with Firebase 
  useEffect(() => {
    if (!state.currentUser) return;

    const eventId = 'alpha-tech-2026';
    
    // Subscribe to tickets
    const unsubTickets = ticketService.watchSales(eventId, 
      (sales) => {
         const typedSales: any[] = sales;
         dispatchBase({ type: 'SET_TICKET_SALES', payload: typedSales });
      },
      (err) => console.error('Tickets stream error:', err)
    );

    const subExpenses = expenseService.getExpenses().subscribe(expenses => {
      dispatchBase({ type: 'SET_EXPENSES', payload: expenses });
    });

    const subMeetings = meetingService.getMeetings().subscribe(meetings => {
      dispatchBase({ type: 'SET_MEETINGS', payload: meetings });
    });
    
    const subRevenues = revenueService.getRevenues().subscribe(revenues => {
      dispatchBase({ type: 'SET_REVENUES', payload: revenues });
    });
    
    const subTeam = teamService.getTeamMembers().subscribe(members => {
      dispatchBase({ type: 'SET_TEAM_MEMBERS', payload: members });
    });

    return () => {
      unsubTickets();
      subExpenses.unsubscribe();
      subMeetings.unsubscribe();
      subRevenues.unsubscribe();
      subTeam.unsubscribe();
    };
  }, [state.currentUser]);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        dispatchBase({ type: 'SYNC_STATE', payload: JSON.parse(stored) });
      }
    } catch(e) {}
    isInitialized.current = true;
  }, []);

  // Enhanced dispatch that syncs to LocalStorage
  const dispatch = React.useCallback((action: AppAction) => {
    dispatchBase(action);
    
    // Defer the local storage write so it happens after the reducer state is applied
    setTimeout(() => {
      // In a real app we'd want to just calculate the next state, 
      // but setTimeout works to read it from where it's stored.
      // Actually state is old here. So we dispatch first, and use effect to save state
    }, 0);
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    if (isInitialized.current) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  // Sync state across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue);
          dispatchBase({ type: 'SYNC_STATE', payload: newState });
        } catch(err) {}
      }
      
      // Wait, to show a notification, we can use a separate EVENT_KEY
      if (e.key === EVENT_KEY && e.newValue) {
        try {
          const event = JSON.parse(e.newValue);
          if (state.currentUser?.role === 'client') {
            switch(event.type) {
               case 'ADD_MEETING':
                 toast("📅 Nouvelle réunion planifiée par l'équipe"); break;
               case 'ADD_EXPENSE':
                 toast("💳 Nouvelle dépense enregistrée par l'équipe"); break;
               case 'ADD_TICKET_SALE':
                 toast.success("🎉 Nouveaux billets vendus par l'équipe !"); break;
               case 'UPDATE_MEETING':
                 toast('📝 Compte rendu de réunion mis à jour'); break;
               case 'ADD_ALERT':
                 if (event.payload?.severity === 'error') toast.error(`🚨 Alerte : ${event.payload?.message}`);
                 else if (event.payload?.severity === 'warning') toast.warning(`⚠️ Attention : ${event.payload?.message}`);
                 else toast(`ℹ️ Info : ${event.payload?.message}`);
                 break;
               case 'UPDATE_EVENT_DATE':
                 toast("📅 La date de l'événement a été mise à jour !"); break;
               case 'ADD_TEAM_MEMBER':
                 toast("👥 Un nouveau membre a été ajouté à l'équipe"); break;
               case 'UPDATE_TEAM_MEMBER':
                 toast("👤 Les informations d'un membre ont été mises à jour"); break;
               case 'DELETE_TEAM_MEMBER':
                 toast("👋 Un membre a été retiré de l'équipe"); break;
            }
          } else {
             switch(event.type) {
               case 'ADD_MEETING': toast('📅 Nouvelle réunion planifiée (Sync)'); break;
               case 'ADD_EXPENSE': toast('💳 Nouvelle dépense (Sync)'); break;
               case 'ADD_TICKET_SALE': toast('🎟 Vente de billets (Sync)'); break;
               case 'UPDATE_MEETING': toast('📝 Compte rendu mis à jour (Sync)'); break;
               case 'ADD_ALERT': toast('🔔 Nouvelle alerte (Sync)'); break;
               case 'UPDATE_EVENT_DATE': toast('📅 Date de l\'événement mise à jour (Sync)'); break;
            }
          }
        } catch(err) {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [state.currentUser]);

  // A dispatch wrapper to actually send the event 
  const dispatchWithSync = React.useCallback((action: AppAction) => {
    dispatchBase(action);
    // Notify other tabs
    if (['ADD_MEETING', 'ADD_EXPENSE', 'ADD_TICKET_SALE', 'UPDATE_MEETING', 'ADD_ALERT', 'UPDATE_EVENT_DATE', 'ADD_TEAM_MEMBER', 'UPDATE_TEAM_MEMBER', 'DELETE_TEAM_MEMBER'].includes(action.type)) {
      if (action.type !== 'SET_USER' && action.type !== 'SYNC_STATE') {
        localStorage.setItem(EVENT_KEY, JSON.stringify({ type: action.type, payload: (action as any).payload, ts: Date.now() }));
      }
    }
    // Also show toast locally if wanted (we can leave it out locally because the user knows what they just did, but they want to receive notifications when OTHERS do it).
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch: dispatchWithSync }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
