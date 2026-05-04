// ─── StatsCard ───────────────────────────────────────────────────────────────

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface StatsCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: string;
  color?: 'primary' | 'secondary' | 'accent' | 'highlight' | 'danger' | 'gold' | 'info' | 'success';
  trend?: { value: string; positive: boolean };
}

const colorMap = {
  primary:  { bg: 'bg-primary/10',   text: 'text-primary',   border: 'border-primary/20' },
  secondary:{ bg: 'bg-secondary/10', text: 'text-secondary', border: 'border-secondary/20' },
  accent:   { bg: 'bg-accent/10',    text: 'text-accent',    border: 'border-accent/20' },
  highlight:{ bg: 'bg-highlight/10', text: 'text-highlight', border: 'border-highlight/20' },
  danger:   { bg: 'bg-danger/10',  text: 'text-danger',  border: 'border-danger/20' },
  gold:     { bg: 'bg-gold/10',    text: 'text-gold',    border: 'border-gold/20' },
  info:     { bg: 'bg-info/10',    text: 'text-info',    border: 'border-info/20' },
  success:  { bg: 'bg-success/10', text: 'text-success', border: 'border-success/20' },
};

export function StatsCard({ label, value, sub, icon, color = 'accent', trend }: StatsCardProps) {
  const c = colorMap[color];
  return (
    <div className={cn('bg-card border rounded-xl p-5 hover-card', c.border)}>
      {icon && (
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3', c.bg)}>
          {icon}
        </div>
      )}
      <div className={cn('text-2xl font-bold mb-1', c.text)}>{value}</div>
      <div className="text-sm text-muted">{label}</div>
      {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
      {trend && (
        <div className={cn('text-xs mt-2 font-medium', trend.positive ? 'text-success' : 'text-danger')}>
          {trend.positive ? '↑' : '↓'} {trend.value}
        </div>
      )}
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────

interface BadgeProps {
  children: ReactNode;
  color?: 'primary' | 'secondary' | 'accent' | 'highlight' | 'danger' | 'gold' | 'info' | 'success' | 'muted';
}

const badgeColors = {
  primary:   'bg-primary/15 text-primary',
  secondary: 'bg-secondary/15 text-secondary',
  accent:    'bg-accent/15 text-accent',
  highlight: 'bg-highlight/12 text-highlight',
  danger:    'bg-danger/12 text-danger',
  gold:      'bg-gold/12 text-gold',
  info:      'bg-info/12 text-info',
  success:   'bg-success/12 text-success',
  muted:     'bg-border text-muted',
};

export function Badge({ children, color = 'accent' }: BadgeProps) {
  return (
    <span className={cn('tag', badgeColors[color])}>
      {children}
    </span>
  );
}

// ─── Button ──────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'highlight' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: string;
}

const btnVariants = {
  primary:   'bg-primary hover:bg-primary/90 text-white border-transparent shadow-sm',
  accent:    'bg-accent hover:bg-accent/90 text-white border-transparent shadow-sm',
  secondary: 'bg-card hover:bg-border border-border text-ink',
  ghost:     'bg-transparent hover:bg-card border-transparent text-muted hover:text-ink',
  danger:    'bg-danger/15 hover:bg-danger/25 text-danger border-danger/30',
  highlight: 'bg-highlight/15 hover:bg-highlight/25 text-highlight border-highlight/30',
};

const btnSizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center gap-2 font-medium rounded-lg border transition-all',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        btnVariants[variant],
        btnSizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : icon ? (
        <span className="text-base leading-none">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}

// ─── Input ───────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-mono uppercase tracking-wider text-muted">{label}</label>}
      <input
        className={cn(
          'w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-ink',
          'placeholder:text-muted/50',
          'focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20',
          'transition-colors',
          error && 'border-danger/50',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

// ─── Select ──────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-mono uppercase tracking-wider text-muted">{label}</label>}
      <select
        className={cn(
          'w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-ink',
          'focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20',
          'transition-colors',
          className
        )}
        {...props}
      >
        {options.map(o => (
          <option key={o.value} value={o.value} className="bg-surface">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Textarea ────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-mono uppercase tracking-wider text-muted">{label}</label>}
      <textarea
        className={cn(
          'w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-ink',
          'placeholder:text-muted/50',
          'focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20',
          'transition-colors',
          className
        )}
        {...props}
      />
    </div>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const modalSizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' };

export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        'relative bg-card border border-border rounded-xl w-full shadow-2xl animate-slide-up',
        modalSizes[size]
      )}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-bold text-base text-ink">{title}</h3>
          <button onClick={onClose} className="text-muted hover:text-ink transition-colors text-xl leading-none">×</button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="px-5 pb-5 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

export function EmptyState({ icon, message, sub }: { icon: string; message: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <div className="font-semibold text-ink mb-1">{message}</div>
      {sub && <div className="text-sm text-muted">{sub}</div>}
    </div>
  );
}

// ─── Progress ────────────────────────────────────────────────────────────────

export function ProgressBar({ percent, color = '#1C92FF' }: { percent: number; color?: string }) {
  return (
    <div className="progress-bar">
      <div className="progress-bar-fill" style={{ width: `${percent}%`, background: color }} />
    </div>
  );
}

// ─── Section Card ────────────────────────────────────────────────────────────

export function SectionCard({ title, subtitle, children, action }: {
  title: string; subtitle?: string; children: ReactNode; action?: ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <div className="font-bold text-sm text-ink">{title}</div>
          {subtitle && <div className="text-xs text-muted mt-0.5">{subtitle}</div>}
        </div>
        {action}
      </div>
      <div>{children}</div>
    </div>
  );
}
