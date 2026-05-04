import {
  Meeting, Expense, TicketSale, Revenue, TeamMember, AppState
} from './types';

// ─── Team Members ──────────────────────────────────────────────────────────

export const initialTeamMembers: TeamMember[] = [
  {
    id: 'fresneil',
    name: 'Fresneil',
    role: 'Expert IA & Cloud Engineering',
    location: 'En ligne',
    isOnline: true,
    slidesReady: false,
    tasks: [
      'Préparer slides Blocs I',
      'Script complet de ton intervention',
      'Coordination générale',
    ],
    email: 'leader@alphatech.local',
  },
  {
    id: 'abraham',
    name: 'Abraham',
    role: 'Full-Stack Developer',
    location: 'Bureau',
    isOnline: false,
    slidesReady: false,
    tasks: [
      'Préparer démo',
      'Démo IA Studio en live',
      'Tutoriel installation',
    ],
    email: 'dev@alphatech.local',
  },
  {
    id: 'jobert',
    name: 'Jobert',
    role: 'Marketing Digital & IA',
    location: 'Bureau',
    isOnline: false,
    slidesReady: false,
    tasks: [
      'Préparer slides Marketing',
      'Créer contenu',
    ],
    email: 'bizdev1@alphatech.local',
  },
  {
    id: 'stefane',
    name: 'Stefane',
    role: 'BizDev / Vente',
    location: 'Bureau',
    isOnline: false,
    slidesReady: false,
    tasks: [
      'Slides Vente',
      'Scripts de vente',
    ],
    email: 'bizdev2@alphatech.local',
  },
];

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
  budgetTotal: 0,
  ticketTarget: 0,
  eventDate: '2026-06-01',
  eventName: 'Événement Alpha tech',
};
