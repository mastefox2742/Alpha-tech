'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { notificationService } from '@/lib/services/notification.service';
import { AppNotification } from '@/lib/types';
import { cn } from '@/lib/utils';

const TYPE_ICON: Record<AppNotification['type'], string> = {
  success: '✅', info: 'ℹ️', warning: '⚠️', error: '🚨',
};

export default function NotificationBell() {
  const { state } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = state.notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Demander permission FCM au premier rendu
  useEffect(() => {
    notificationService.requestPushPermission().catch(() => {});
  }, []);

  // Écouter les messages FCM en foreground
  useEffect(() => {
    const unsub = notificationService.onForegroundMessage(payload => {
      const { title, body } = payload.notification || {};
      if (title) {
        notificationService.send({ title, message: body || '', type: 'info' }).catch(() => {});
      }
    });
    return () => { if (typeof unsub === 'function') unsub(); };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-xl hover:bg-border/40 transition-colors text-muted hover:text-ink"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-bold text-sm text-ink">Notifications</h3>
            {unread > 0 && (
              <button
                onClick={() => notificationService.markAllRead()}
                className="text-xs text-highlight hover:underline"
              >
                Tout marquer lu
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {state.notifications.length === 0 ? (
              <div className="p-6 text-center text-muted text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Aucune notification
              </div>
            ) : (
              state.notifications.slice(0, 20).map(n => (
                <div
                  key={n.id}
                  onClick={() => notificationService.markRead(n.id)}
                  className={cn(
                    'flex items-start gap-3 p-3 border-b border-border last:border-0 cursor-pointer hover:bg-border/20 transition-colors',
                    !n.read && 'bg-highlight/5'
                  )}
                >
                  <span className="text-lg shrink-0">{TYPE_ICON[n.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-semibold', !n.read ? 'text-ink' : 'text-muted')}>{n.title}</p>
                    <p className="text-xs text-muted line-clamp-2">{n.message}</p>
                    <p className="text-xs text-muted/60 mt-0.5">{new Date(n.createdAt).toLocaleString('fr-FR')}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-highlight mt-1.5 shrink-0" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
