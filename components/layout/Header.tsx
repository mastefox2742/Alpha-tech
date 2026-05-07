'use client';

import { useApp } from '@/contexts/AppContext';
import { daysUntilEvent } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { useCurrentUser } from '@/components/layout/AuthGuard';

interface HeaderProps {
  title: string;
  subtitle?: string;
  role?: 'client' | 'staff' | 'admin';
  action?: React.ReactNode;
}

export default function Header({ title, subtitle, role = 'client', action }: HeaderProps) {
  const { state } = useApp();
  const { user } = useCurrentUser();
  const days = daysUntilEvent(state.eventDate);

  const getRoleEmoji = (r: string) => {
    if (r === 'admin') return '👑';
    if (r === 'staff') return '⚙️';
    return '👁️';
  };

  const getRoleColor = (r: string) => {
    if (r === 'admin') return 'bg-danger/10 text-danger';
    if (r === 'staff') return 'bg-highlight/10 text-highlight';
    return 'bg-accent/10 text-accent';
  };

  return (
    <header className="border-b border-border bg-surface/60 backdrop-blur-sm px-4 md:px-6 py-4 flex items-center justify-between gap-2 md:gap-4 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => window.dispatchEvent(new Event('toggle-sidebar'))}
          className="md:hidden p-2 -ml-2 text-muted hover:text-ink bg-transparent hover:bg-black/5 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          {user?.displayName && (
            <div className="h-10 w-10 rounded-full bg-border text-ink flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 border border-muted/20">
               {user.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="font-bold text-lg text-ink leading-tight">{title}</h1>
            {user?.displayName ? (
              <p className="text-sm text-muted mt-0.5">Bonjour, {user.displayName} 👋</p>
            ) : (
              subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Countdown */}
        <div className={cn(
          'hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono',
          days <= 30
            ? 'border-danger/30 bg-danger/8 text-danger'
            : 'border-border bg-surface text-muted'
        )}>
          <span className={days <= 30 ? 'animate-pulse-slow' : ''}>⏳</span>
          <span>J-{days} · {state.eventName.split('—')[0].trim()}</span>
        </div>

        {action}

        {/* User badge */}
        <div className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium',
          getRoleColor(user?.role ?? role)
        )}>
          <span>{getRoleEmoji(user?.role ?? role)}</span>
          <span className="hidden md:inline">{user?.role === 'admin' ? 'Administrateur' : user?.role === 'staff' ? 'Staff' : 'Client'}</span>
        </div>
      </div>
    </header>
  );
}
