'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import Image from 'next/image';

import { authService } from '@/lib/services/auth.service';
import { useCurrentUser } from '@/components/layout/AuthGuard';

interface NavItem {
  href: string;
  icon: string;
  label: string;
}

const clientNav: NavItem[] = [
  { href: '/client',           icon: '📊', label: 'Dashboard' },
  { href: '/client/projets',   icon: '📁', label: 'Projets' },
  { href: '/client/finances',  icon: '💰', label: 'Finances' },
  { href: '/client/billets',   icon: '🎟', label: 'Billets & Revenus' },
  { href: '/client/reunions',  icon: '📋', label: 'Réunions' },
  { href: '/client/planning',  icon: '📅', label: 'Planning' },
  { href: '/client/equipe',    icon: '👥', label: 'L\'Équipe' },
  { href: '/client/rapports',  icon: '📈', label: 'Rapports' },
];

const staffNav: NavItem[] = [
  { href: '/staff',              icon: '🏠', label: 'Dashboard' },
  { href: '/staff/projets',      icon: '📁', label: 'Projets' },
  { href: '/staff/leads',        icon: '💬', label: 'Leads & CRM' },
  { href: '/staff/inscriptions', icon: '📝', label: 'Inscriptions' },
  { href: '/staff/notes',        icon: '✍️', label: 'Notes de réunion' },
  { href: '/staff/depenses',     icon: '💸', label: 'Dépenses' },
  { href: '/staff/billets',      icon: '🎟', label: 'Billets & Revenus' },
  { href: '/staff/planning',     icon: '📅', label: 'Planifier réunion' },
  { href: '/staff/equipe',       icon: '👥', label: 'L\'Équipe' },
  { href: '/staff/assistant',    icon: '🤖', label: 'Assistant IA' },
];

interface SidebarProps {
  role: 'client' | 'staff';
}

export default function Sidebar({ role }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { dispatch } = useApp();
  const { user: currentUser } = useCurrentUser();
  const nav = role === 'client' ? clientNav : staffNav;
  const accentClass = role === 'client' ? 'text-accent' : 'text-highlight';
  const isActive = (href: string) =>
    href === (role === 'client' ? '/client' : '/staff')
      ? pathname === href
      : pathname.startsWith(href);

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    const handleClose = () => setIsOpen(false);
    
    window.addEventListener('toggle-sidebar', handleToggle);
    window.addEventListener('close-sidebar', handleClose);
    return () => {
      window.removeEventListener('toggle-sidebar', handleToggle);
      window.removeEventListener('close-sidebar', handleClose);
    };
  }, []);

  function logout() {
    authService.logout().subscribe(() => {
      dispatch({ type: 'SET_USER', payload: null });
      router.push('/');
    });
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-ink/30 z-30 md:hidden backdrop-blur-sm" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Sidebar Content */}
      <aside className={cn(
        "w-56 flex-shrink-0 bg-surface border-r border-border flex flex-col h-screen fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 md:sticky md:top-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-9 h-9 rounded-lg flex items-center justify-center text-lg shadow-sm relative overflow-hidden',
            role === 'client' ? 'bg-accent/10 border border-accent/20' : 'bg-highlight/10 border border-highlight/20'
          )}>
            <Image src="/logo.jpg" alt="Alpha tech" fill sizes="36px" className="object-cover" referrerPolicy="no-referrer" priority />
          </div>
          <div>
            <div className="font-bold text-sm text-ink leading-none">Alpha tech</div>
            <div className={cn('text-xs font-mono uppercase tracking-wider mt-0.5', accentClass)}>
              {role === 'client' ? 'Équipe' : currentUser?.role === 'admin' ? 'Administrateur' : 'Secrétaire'}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {nav.map(item => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={cn(
              'nav-link',
              isActive(item.href) && (role === 'client' ? 'active' : 'active-staff')
            )}
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Switch role link removed in order to enforce strict space isolation */}
      <div className="p-3 border-t border-border space-y-1">
        <button
          onClick={logout}
          className="nav-link w-full text-left text-xs hover:text-danger"
        >
          <span>🚪</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
    </>
  );
}
