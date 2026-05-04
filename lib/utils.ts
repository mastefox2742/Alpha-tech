import { clsx, type ClassValue } from 'clsx';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Expense, TicketSale, Revenue } from './types';

// ─── CSS class merging ──────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// ─── Date formatting ────────────────────────────────────────────────────────

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd MMMM yyyy', { locale: fr });
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd/MM/yyyy', { locale: fr });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string, time?: string): string {
  try {
    const base = format(parseISO(dateStr), 'EEEE dd MMMM yyyy', { locale: fr });
    return time ? `${base} à ${time}` : base;
  } catch {
    return dateStr;
  }
}

export function timeAgo(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { locale: fr, addSuffix: true });
  } catch {
    return '';
  }
}

// ─── Currency formatting ────────────────────────────────────────────────────

export function formatCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
}

// ─── Finance calculations ───────────────────────────────────────────────────

export function getTotalExpenses(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function getTotalRevenues(ticketSales: TicketSale[], revenues: Revenue[]): number {
  const fromTickets = ticketSales.reduce((sum, t) => sum + t.total, 0);
  const fromOther = revenues.reduce((sum, r) => sum + r.amount, 0);
  return fromTickets + fromOther;
}

export function getNetBalance(
  ticketSales: TicketSale[],
  revenues: Revenue[],
  expenses: Expense[]
): number {
  return getTotalRevenues(ticketSales, revenues) - getTotalExpenses(expenses);
}

export function getTotalTicketsSold(ticketSales: TicketSale[]): number {
  return ticketSales.reduce((sum, t) => sum + t.quantity, 0);
}

export function getTotalTicketRevenue(ticketSales: TicketSale[]): number {
  return ticketSales.reduce((sum, t) => sum + t.total, 0);
}

export function getExpensesByCategory(expenses: Expense[]): Record<string, number> {
  return expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);
}

// ─── ID generation ──────────────────────────────────────────────────────────

export function generateId(): string {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

// ─── Color helpers ──────────────────────────────────────────────────────────

export const categoryColors: Record<string, string> = {
  'Salle & Logistique':          '#0ea5e9',
  'Transport':                   '#2563eb',
  'Matériel & Technique':        '#10b981',
  'Communication & Marketing':   '#f59e0b',
  'Traiteur & Restauration':     '#ef4444',
  'Divers':                      '#64748b',
};

export const ticketColors: Record<string, string> = {
  VIP:      '#f59e0b',
  Standard: '#0ea5e9',
  Gratuit:  '#64748b',
};

// ─── Progress ───────────────────────────────────────────────────────────────

export function getProgressPercent(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

// ─── Days until event ───────────────────────────────────────────────────────

export function daysUntilEvent(eventDateStr: string): number {
  const today = new Date();
  const event = parseISO(eventDateStr);
  const diff = event.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
