// ─── Users ──────────────────────────────────────────────────────────────────

export type UserRole = 'client' | 'staff' | 'team' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
}

// ─── Meetings ───────────────────────────────────────────────────────────────

export type MeetingStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

export interface Action {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  completed: boolean;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;          // ISO date string
  time: string;          // "HH:MM"
  location: string;      // "En ligne (Zoom)" | "Brazzaville" | etc.
  participants: string[];
  agenda: string[];
  rawNotes: string;
  summary: string;       // IA-generated
  decisions: string[];
  actions: Action[];
  status: MeetingStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Finances ───────────────────────────────────────────────────────────────

export type ExpenseCategory =
  | 'Salle & Logistique'
  | 'Transport'
  | 'Matériel & Technique'
  | 'Communication & Marketing'
  | 'Traiteur & Restauration'
  | 'Divers';

export interface Expense {
  id: string;
  description: string;
  amount: number;        // in CFA (FCFA)
  category: ExpenseCategory;
  paidBy: string;
  date: string;
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
}

export type TicketType = 'VIP' | 'Standard' | 'Gratuit';
export type SaleChannel = 'WhatsApp' | 'Sur place' | 'Facebook' | 'Email' | 'Partenaire';

export interface TicketSale {
  id: string;
  type: TicketType;
  quantity: number;
  unitPrice: number;
  total: number;
  channel: SaleChannel;
  buyerName?: string;
  date: string;
  createdAt: string;
}

export interface Revenue {
  id: string;
  description: string;
  amount: number;
  type: 'ticket' | 'sponsor' | 'partner' | 'other';
  date: string;
  createdAt: string;
}

// ─── Team ───────────────────────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  jobTitle?: string;
  location: string;
  isOnline: boolean;
  tasks: string[];
  slidesReady: boolean;
  email?: string;
  phone?: string;
}

// ─── Alerts & Errors ────────────────────────────────────────────────────────

export interface Registration {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

export type AlertSeverity = 'info' | 'warning' | 'error';

export interface Alert {
  id: string;
  message: string;
  severity: AlertSeverity;
  date: string;
  read: boolean;
}

// ─── Global App State ────────────────────────────────────────────────────────

export interface AppState {
  currentUser: User | null;
  meetings: Meeting[];
  expenses: Expense[];
  ticketSales: TicketSale[];
  revenues: Revenue[];
  teamMembers: TeamMember[];
  alerts: Alert[];
  projects: Project[];
  leads: Lead[];
  notifications: AppNotification[];
  // Config
  budgetTotal: number;
  ticketTarget: number;
  eventDate: string;
  eventName: string;
}

// ─── Action types for reducer ────────────────────────────────────────────────

export type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_MEETINGS'; payload: Meeting[] }
  | { type: 'SET_EXPENSES'; payload: Expense[] }
  | { type: 'SET_TICKET_SALES'; payload: TicketSale[] }
  | { type: 'SET_REVENUES'; payload: Revenue[] }
  | { type: 'SET_TEAM_MEMBERS'; payload: TeamMember[] }
  | { type: 'ADD_MEETING'; payload: Meeting }
  | { type: 'UPDATE_MEETING'; payload: Meeting }
  | { type: 'DELETE_MEETING'; payload: string }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'ADD_TICKET_SALE'; payload: TicketSale }
  | { type: 'DELETE_TICKET_SALE'; payload: string }
  | { type: 'ADD_REVENUE'; payload: Revenue }
  | { type: 'ADD_TEAM_MEMBER'; payload: TeamMember }
  | { type: 'UPDATE_TEAM_MEMBER'; payload: TeamMember }
  | { type: 'DELETE_TEAM_MEMBER'; payload: string }
  | { type: 'TOGGLE_ACTION'; payload: { meetingId: string; actionId: string } }
  | { type: 'MARK_ALERT_READ'; payload: string }
  | { type: 'DISMISS_ALERT'; payload: string }
  | { type: 'ADD_ALERT'; payload: Alert }
  | { type: 'UPDATE_EVENT_DATE'; payload: string }
  | { type: 'UPDATE_BUDGET_TOTAL'; payload: number }
  | { type: 'UPDATE_TICKET_TARGET'; payload: number }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'SET_LEADS'; payload: Lead[] }
  | { type: 'SET_NOTIFICATIONS'; payload: AppNotification[] }
  | { type: 'SYNC_STATE'; payload: AppState };

// ─── Projects ───────────────────────────────────────────────────────────────

export type ProjectStatus = 'en_attente' | 'en_cours' | 'termine' | 'annule';
export type ProjectPriority = 'haute' | 'normale' | 'basse';

export interface ProjectTask {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  client: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string;
  endDate: string;
  teamMembers: string[];
  tasks: ProjectTask[];
  notes: string;
  budget?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Leads / CRM ────────────────────────────────────────────────────────────

export type LeadStatus = 'nouveau' | 'en_cours' | 'traite' | 'archive';

export interface Lead {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: LeadStatus;
  notes: string;
  createdAt: string;
  updatedAt?: string;
}

// ─── Notifications ──────────────────────────────────────────────────────────

export type NotifType = 'info' | 'success' | 'warning' | 'error';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotifType;
  read: boolean;
  link?: string;
  createdAt: string;
}

// ─── AI ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface GeneratedSummary {
  summary: string;
  decisions: string[];
  actions: Array<{ description: string; assignedTo: string; dueDate: string }>;
  nextMeetingDate?: string;
}
