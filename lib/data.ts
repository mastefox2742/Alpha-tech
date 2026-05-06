import {
  Meeting, Expense, TicketSale, Revenue, TeamMember, AppState
} from './types';


// ─── Team Members ──────────────────────────────────────────────────────────

export const initialTeamMembers: TeamMember[] = [];

// ─── Initial Meetings ──────────────────────────────────────────────────────

export const initialMeetings: Meeting[] = [];

// ─── Initial Expenses ──────────────────────────────────────────────────────

export const initialExpenses: Expense[] = [];

// ─── Initial Ticket Sales ──────────────────────────────────────────────────

export const initialTicketSales: TicketSale[] = [];

// ─── Initial Revenues ──────────────────────────────────────────────────────

export const initialRevenues: Revenue[] = [];

// ─── Initial App State ─────────────────────────────────────────────────────

export const initialState: AppState = {
  currentUser: null,
  meetings: initialMeetings,
  expenses: initialExpenses,
  ticketSales: initialTicketSales,
  revenues: initialRevenues,
  teamMembers: initialTeamMembers,
  alerts: [],
  projects: [],
  leads: [],
  notifications: [],
  budgetTotal: 0,
  ticketTarget: 0,
  eventDate: '2026-06-01',
  eventName: 'Événement Alpha tech',
};
