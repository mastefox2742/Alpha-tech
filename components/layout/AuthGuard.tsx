// ─────────────────────────────────────────────────────────────────────────────
// auth.guard.ts / AuthGuard.tsx
// Protection des routes côté client.
//
// ⚠️  CE GUARD EST UNE COUCHE UX, PAS UNE COUCHE DE SÉCURITÉ.
// La vraie sécurité est dans les Firestore Security Rules.
// Ce guard empêche juste d'afficher des pages à des utilisateurs non autorisés.
// Même si quelqu'un le bypass (F12, manipulation JS), il ne pourra pas
// lire/écrire en base car les Rules refuseront ses requêtes.
// ─────────────────────────────────────────────────────────────────────────────

'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService, AuthUser, UserRole } from '@/lib/services/auth.service';

// ─── Hook useAuthGuard ────────────────────────────────────────────────────────

interface UseAuthGuardOptions {
  requiredRole?: UserRole;
  redirectTo?:  string;
}

interface GuardState {
  loading:       boolean;
  authorized:    boolean;
  user:          AuthUser | null;
}

export function useAuthGuard(options: UseAuthGuardOptions = {}): GuardState {
  const { requiredRole, redirectTo = '/' } = options;
  const router = useRouter();

  const [state, setState] = useState<GuardState>({
    loading:    true,
    authorized: false,
    user:       null,
  });

  useEffect(() => {
    // Subscribe à l'Observable Firebase (remplace le check localStorage)
    const subscription = authService.user$.subscribe(user => {

      if (!user) {
        // Non authentifié → redirection immédiate
        router.replace(redirectTo);
        setState({ loading: false, authorized: false, user: null });
        return;
      }

      // Vérification du rôle si requis
      if (requiredRole) {
        const hasAccess = checkRoleAccess(user, requiredRole);
        if (!hasAccess) {
          // Authentifié mais rôle insuffisant
          router.replace('/unauthorized');
          setState({ loading: false, authorized: false, user });
          return;
        }
      }

      setState({ loading: false, authorized: true, user });
    });

    return () => subscription.unsubscribe();
  }, [requiredRole, redirectTo, router]);

  return state;
}

// ─── Vérification hiérarchique des rôles ─────────────────────────────────────

/**
 * Hiérarchie : admin > staff > team
 * Un admin a tous les droits d'un staff, qui a tous les droits d'un team.
 */
function checkRoleAccess(user: AuthUser, requiredRole: UserRole): boolean {
  if (user.isAdmin) return true;  // Admin accède à tout

  switch (requiredRole) {
    case 'team':  return true;           // Tous les rôles peuvent accéder
    case 'staff': return user.isStaff;   // Staff ou admin
    case 'admin': return user.isAdmin;   // Admin seulement
    default:      return false;
  }
}

// ─── Composant AuthGuard ──────────────────────────────────────────────────────

interface AuthGuardProps {
  children:      ReactNode;
  requiredRole?: UserRole;
  fallback?:     ReactNode;
}

export function AuthGuard({ children, requiredRole, fallback }: AuthGuardProps) {
  const { loading, authorized } = useAuthGuard({ requiredRole });

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          <p className="text-muted text-sm font-mono">Vérification des droits...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}

// ─── HOC withAuth ─────────────────────────────────────────────────────────────

/**
 * Higher-Order Component pour protéger une page entière.
 *
 * Usage :
 *   export default withAuth(MyPage, { requiredRole: 'staff' });
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: UseAuthGuardOptions = {}
) {
  return function ProtectedComponent(props: P) {
    const { loading, authorized, user } = useAuthGuard(options);

    if (loading) {
      return (
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      );
    }

    if (!authorized) return null;

    // Injection de l'utilisateur comme prop si le composant l'accepte
    return <Component {...props} currentUser={user} />;
  };
}

// ─── Hook useCurrentUser ──────────────────────────────────────────────────────

/**
 * Accès simple à l'utilisateur courant dans n'importe quel composant.
 * Retourne null pendant le chargement.
 *
 * ⚠️  NE PAS UTILISER pour des décisions de sécurité critiques.
 *     Pour la vraie sécurité, se fier aux Security Rules Firestore.
 */
export function useCurrentUser(): { user: AuthUser | null; loading: boolean } {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sub = authService.user$.subscribe(u => {
      setUser(u);
      setLoading(false);
    });
    return () => sub.unsubscribe();
  }, []);

  return { user, loading };
}
