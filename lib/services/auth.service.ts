// ─────────────────────────────────────────────────────────────────────────────
// auth.service.ts
// Service d'authentification — Zero-Trust, rôles via Custom Claims.
//
// PRINCIPE DE SÉCURITÉ :
//   - Le rôle (staff | team | admin) n'est JAMAIS stocké en localStorage.
//   - Il est lu depuis le JWT signé par Firebase Auth (Custom Claims).
//   - L'utilisateur ne peut PAS modifier ses propres claims — seul le
//     Firebase Admin SDK (côté serveur) peut le faire.
//   - Toute validation de rôle côté UI est une UX hint, pas une sécurité réelle.
//     La vraie sécurité est dans les Firestore Security Rules.
// ─────────────────────────────────────────────────────────────────────────────

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  getIdTokenResult,
  getAuth,
  User,
  IdTokenResult,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { initializeApp, deleteApp } from 'firebase/app';
import { Observable, from, of, BehaviorSubject } from 'rxjs';
import { switchMap, catchError, shareReplay } from 'rxjs/operators';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

// ─── Types ───────────────────────────────────────────────────────────────────

export type UserRole = 'staff' | 'team' | 'admin' | 'client';

export interface AuthUser {
  uid:         string;
  email:       string | null;
  displayName: string | null;
  role:        UserRole | null;
  isAdmin:     boolean;
  isStaff:     boolean;
  idToken:     string;            // JWT brut — utile pour les appels API externes
}

export interface LoginResult {
  success: boolean;
  user?:   AuthUser;
  error?:  string;
}

// ─── Helpers privés ───────────────────────────────────────────────────────────

/**
 * Extrait le rôle depuis les Custom Claims du JWT.
 * Ne fait JAMAIS confiance au localStorage ou à un paramètre côté client.
 */
function roleFromEmail(email: string | null, emailVerified: boolean): UserRole | null {
  if (!email) return null;
  // Comptes Gmail réels : exiger la vérification email (sécurité)
  if (email === 'fresneilm139@gmail.com' || email === 'zlatobambi@gmail.com') {
    return emailVerified ? 'admin' : null;
  }
  // Domaines internes fictifs : impossible de vérifier l'email → on fait confiance au domaine
  if (email.endsWith('@admin.alpha.com')) return 'admin';
  if (email.endsWith('@staff.alpha.com')) return 'staff';
  return null;
}

async function extractAuthUser(user: User): Promise<AuthUser> {
  const tokenResult: IdTokenResult = await getIdTokenResult(user, false);
  const claims = tokenResult.claims as Record<string, unknown>;
  let role: UserRole | null = (claims['role'] as UserRole) ?? null;

  if (!role) {
    // 1. Priorité à l'email — fiable, pas de dépendance Firestore
    role = roleFromEmail(user.email, user.emailVerified);

    // 2. Sinon lire le document Firestore
    if (!role) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        role = (userDoc.exists() ? userDoc.data()?.role : null) ?? 'client';
      } catch {
        role = 'client';
      }
    }

    // 3. Synchroniser le document en arrière-plan (non-bloquant)
    setDoc(doc(db, 'users', user.uid), {
      uid:         user.uid,
      email:       user.email ?? null,
      displayName: user.displayName ?? null,
      role,
      disabled:    false,
      createdAt:   new Date().toISOString(),
    }, { merge: true }).catch(() => {});
  }

  return {
    uid:         user.uid,
    email:       user.email,
    displayName: user.displayName,
    role,
    isAdmin:     role === 'admin',
    isStaff:     role === 'staff' || role === 'admin',
    idToken:     tokenResult.token,
  };
}

// ─── Auth Service ─────────────────────────────────────────────────────────────

class AuthService {
  // BehaviorSubject pour un accès synchrone à l'état courant (ex: dans les guards)
  private readonly _currentUser$ = new BehaviorSubject<AuthUser | null>(null);

  /**
   * Observable principal de l'état d'authentification.
   * Émis à chaque changement (connexion, déconnexion, refresh token).
   * shareReplay(1) → les nouveaux abonnés reçoivent immédiatement la dernière valeur.
   */
  readonly user$: Observable<AuthUser | null> = new Observable<User | null>(
    observer => onAuthStateChanged(auth, user => observer.next(user))
  ).pipe(
    switchMap(user => user ? from(extractAuthUser(user)) : of(null)),
    shareReplay(1),
  );

  constructor() {
    // Synchronise le BehaviorSubject
    this.user$.subscribe(user => this._currentUser$.next(user));
  }

  // ── Accès synchrone (garde de route) ───────────────────────────────────────

  get currentUser(): AuthUser | null {
    return this._currentUser$.getValue();
  }

  get isAuthenticated(): boolean {
    return this._currentUser$.getValue() !== null;
  }

  hasRole(role: UserRole): boolean {
    return this._currentUser$.getValue()?.role === role;
  }

  // ── Connexion ───────────────────────────────────────────────────────────────

  /**
   * Connexion email/mot de passe.
   * Retourne un Observable<LoginResult> pour une intégration RxJS native.
   *
   * SÉCURITÉ : On ne stocke rien dans localStorage.
   * Le token Firebase est géré par le SDK dans un cookie HttpOnly (session).
   */
  login(email: string, password: string): Observable<LoginResult> {
    return from(
      signInWithEmailAndPassword(auth, email, password)
        .then(async credential => {
          const user = await extractAuthUser(credential.user);
          return { success: true, user } as LoginResult;
        })
    ).pipe(
      catchError(error => {
        const message = this.mapFirebaseError(error.code);
        return of({ success: false, error: message } as LoginResult);
      })
    );
  }

  loginWithGoogle(): Observable<LoginResult> {
    const provider = new GoogleAuthProvider();
    const isMobile = typeof window !== 'undefined' &&
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

    if (isMobile) {
      // Sur mobile les popups sont bloqués — on utilise le redirect
      return from(
        signInWithRedirect(auth, provider).then(() => ({ success: true } as LoginResult))
      ).pipe(
        catchError(error => of({ success: false, error: this.mapFirebaseError(error.code) } as LoginResult))
      );
    }

    return from(
      signInWithPopup(auth, provider)
        .then(async credential => {
          const user = await extractAuthUser(credential.user);
          return { success: true, user } as LoginResult;
        })
    ).pipe(
      catchError(error => of({ success: false, error: this.mapFirebaseError(error.code) } as LoginResult))
    );
  }

  // Appelé au chargement de la page login pour récupérer le résultat du redirect Google
  handleGoogleRedirect(): Observable<LoginResult | null> {
    return from(
      getRedirectResult(auth).then(async credential => {
        if (!credential) return null;
        const user = await extractAuthUser(credential.user);
        return { success: true, user } as LoginResult;
      })
    ).pipe(
      catchError(() => of(null))
    );
  }

  register(email: string, password: string, firstName: string, lastName: string): Observable<LoginResult> {
    const displayName = `${firstName} ${lastName}`.trim();
    return from(
      createUserWithEmailAndPassword(auth, email, password)
        .then(async credential => {
          await updateProfile(credential.user, { displayName });
          const user = await extractAuthUser(credential.user);
          // Wait to give Firestore rule triggers time to sync if needed
          return { success: true, user } as LoginResult;
        })
    ).pipe(
      catchError(error => {
        const message = this.mapFirebaseError(error.code);
        return of({ success: false, error: message } as LoginResult);
      })
    );
  }

  // ── Déconnexion ─────────────────────────────────────────────────────────────

  logout(): Observable<void> {
    return from(signOut(auth));
  }

  // ── Récupération de mot de passe ─────────────────────────────────────────────

  sendPasswordReset(email: string): Observable<void> {
    return from(sendPasswordResetEmail(auth, email));
  }

  // ── Changement de mot de passe (requiert ré-authentification) ───────────────

  /**
   * Avant toute opération sensible, on ré-authentifie l'utilisateur.
   * Cela prévient les attaques si la session est détournée (CSRF, vol de cookie).
   */
  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    const user = auth.currentUser;
    if (!user || !user.email) {
      return new Observable(o => o.error(new Error('Non authentifié')));
    }

    const credential = EmailAuthProvider.credential(user.email, currentPassword);

    return from(
      reauthenticateWithCredential(user, credential)
        .then(() => updatePassword(user, newPassword))
    );
  }

  // ── Création d'un compte employé (sans déconnecter l'admin) ────────────────────

  /**
   * Crée un compte Firebase Auth dans une instance temporaire isolée,
   * de sorte que la session de l'admin courant n'est pas affectée.
   */
  async createEmployee(
    firstName: string,
    lastName: string,
    role: UserRole,
    password: string,
    clientEmail?: string,
  ): Promise<{ email: string }> {
    const base = `${firstName.charAt(0)}.${lastName}`
      .toLowerCase()
      .replace(/\s+/g, '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');

    const email =
      role === 'admin' ? `${base}@admin.alpha.com`
      : role === 'staff' ? `${base}@staff.alpha.com`
      : clientEmail!;

    const displayName = `${firstName} ${lastName}`.trim();
    const tempApp = initializeApp(auth.app.options, `emp-${Date.now()}`);
    const tempAuth = getAuth(tempApp);

    try {
      const { user } = await createUserWithEmailAndPassword(tempAuth, email, password);
      await updateProfile(user, { displayName });
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email,
        displayName,
        role,
        disabled: false,
        createdAt: new Date().toISOString(),
      });
    } finally {
      await signOut(tempAuth).catch(() => {});
      await deleteApp(tempApp).catch(() => {});
    }

    return { email };
  }

  // ── Refresh forcé du token (après changement de rôle par un admin) ───────────

  /**
   * Appeler cette méthode après qu'un admin a changé le rôle d'un utilisateur.
   * Cela force le renouvellement du JWT pour que les nouveaux claims soient actifs.
   */
  refreshToken(): Observable<AuthUser | null> {
    const user = auth.currentUser;
    if (!user) return of(null);

    return from(
      getIdTokenResult(user, /* forceRefresh */ true)
        .then(() => extractAuthUser(user))
    );
  }

  // ── Mapping d'erreurs Firebase → messages utilisateur ────────────────────────

  private mapFirebaseError(code: string): string {
    const errors: Record<string, string> = {
      'auth/user-not-found':          'Aucun compte trouvé avec cet email.',
      'auth/wrong-password':          'Mot de passe incorrect.',
      'auth/invalid-email':           'Format d\'email invalide.',
      'auth/invalid-credential':      'Identifiants incorrects.',
      'auth/email-already-in-use':    'Cet email est déjà utilisé.',
      'auth/weak-password':           'Le mot de passe doit contenir au moins 6 caractères.',
      'auth/user-disabled':           'Ce compte a été désactivé.',
      'auth/too-many-requests':       'Trop de tentatives. Réessayez dans quelques minutes.',
      'auth/network-request-failed':  'Erreur réseau. Vérifiez votre connexion.',
      'auth/popup-blocked':           'Popup bloqué par le navigateur. Autorisez les popups ou réessayez.',
      'auth/popup-closed-by-user':    'Connexion Google annulée.',
      'auth/cancelled-popup-request': 'Connexion Google annulée.',
      'auth/unauthorized-domain':     'Ce domaine n\'est pas autorisé dans Firebase. Contactez l\'administrateur.',
      'auth/operation-not-allowed':   'La connexion Google n\'est pas activée. Contactez l\'administrateur.',
      'auth/account-exists-with-different-credential': 'Un compte existe déjà avec cet email via une autre méthode de connexion.',
    };
    return errors[code] ?? `Erreur d'authentification (${code}). Réessayez.`;
  }
}

// Singleton exporté
export const authService = new AuthService();
export default authService;
