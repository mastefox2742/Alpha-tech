// ─────────────────────────────────────────────────────────────────────────────
// ticket.service.ts
// Service de gestion des billets — REMPLACE le localStorage par Firestore.
//
// ARCHITECTURE ZERO-TRUST :
//   - Lecture/écriture uniquement via Firestore SDK (jamais directement).
//   - Les Security Rules vérifient le JWT à chaque opération.
//   - La validation métier (stock, prix) est dupliquée en Cloud Function
//     pour que le client ne puisse pas la bypasser.
//   - Aucune donnée sensible n'est mise en cache côté client.
// ─────────────────────────────────────────────────────────────────────────────

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  runTransaction,
  DocumentReference,
  Unsubscribe,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { Observable, from } from 'rxjs';
import { db, functions } from '../firebase';
import { authService } from './auth.service';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TicketType    = 'VIP' | 'Standard' | 'Gratuit';
export type SaleChannel   = 'WhatsApp' | 'Sur place' | 'Facebook' | 'Email' | 'Partenaire';
export type TicketStatus  = 'active' | 'cancelled' | 'refunded';

export interface TicketSale {
  id?:          string;
  type:         TicketType;
  quantity:     number;
  unitPrice:    number;
  total:        number;
  channel:      SaleChannel;
  buyerName?:   string;
  buyerEmail?:  string;          // Ajouté pour la traçabilité
  date:         string;
  status:       TicketStatus;
  createdBy:    string;          // uid Firebase
  createdAt?:   Timestamp;
  updatedAt?:   Timestamp;
  eventId:      string;          // Rattaché à un événement spécifique
}

export interface CreateTicketPayload {
  type:        TicketType;
  quantity:    number;
  channel:     SaleChannel;
  buyerName?:  string;
  buyerEmail?: string;
  eventId:     string;
}

// ─── Chemins Firestore ────────────────────────────────────────────────────────

const TICKETS_COLLECTION = 'ticketSales';

// ─── Cloud Function pour validation serveur ───────────────────────────────────

interface CreateTicketRequest  { payload: CreateTicketPayload }
interface CreateTicketResponse { ticketId: string; total: number }

const createTicketSecure = httpsCallable<CreateTicketRequest, CreateTicketResponse>(
  functions,
  'createTicketSale'
);

// ─── Ticket Service ────────────────────────────────────────────────────────────

class TicketService {

  // ── Créer une vente (via Cloud Function pour validation serveur) ─────────────

  /**
   * La création passe par une Cloud Function, pas directement par Firestore.
   *
   * POURQUOI :
   *   - La Function valide le stock disponible, le prix unitaire, les quotas.
   *   - Si on écrivait directement en Firestore, un utilisateur averti pourrait
   *     passer unitPrice=0 via DevTools et créer des billets gratuits.
   *   - La Function s'exécute en environnement de confiance avec le Admin SDK.
   */
  async createSale(payload: CreateTicketPayload): Promise<string> {
    this.assertAuthenticated();

    try {
      const result = await createTicketSecure({ payload });
      return result.data.ticketId;
    } catch (error: unknown) {
      throw this.handleError('createSale', error);
    }
  }

  // ── Lire toutes les ventes (temps réel) ──────────────────────────────────────

  /**
   * Retourne un Observable qui émet à chaque modification Firestore.
   * Les Security Rules garantissent que seuls staff/admin peuvent lire.
   *
   * L'Unsubscribe est retourné séparément pour le cleanup (useEffect).
   */
  watchSales(
    eventId: string,
    onData: (sales: TicketSale[]) => void,
    onError: (err: Error) => void
  ): Unsubscribe {
    this.assertAuthenticated();

    const q = query(
      collection(db, TICKETS_COLLECTION),
      where('eventId', '==', eventId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(500)
    );

    return onSnapshot(
      q,
      snapshot => {
        const sales: TicketSale[] = snapshot.docs.map(d => ({
          id: d.id,
          ...(d.data() as Omit<TicketSale, 'id'>),
        }));
        onData(sales);
      },
      err => onError(new Error(`Firestore snapshot error: ${err.message}`))
    );
  }

  // ── Lire une vente par ID ─────────────────────────────────────────────────────

  async getSaleById(ticketId: string): Promise<TicketSale | null> {
    this.assertAuthenticated();

    const ref = doc(db, TICKETS_COLLECTION, ticketId);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<TicketSale, 'id'>) };
  }

  // ── Annuler une vente ─────────────────────────────────────────────────────────

  /**
   * Annulation via transaction pour garantir l'atomicité.
   * On met à jour le statut ET on décrémente le compteur global dans 'events'.
   * Impossible à contourner : les Rules vérifient le rôle ET que status !== 'cancelled'.
   */
  async cancelSale(ticketId: string): Promise<void> {
    this.assertAuthenticated();
    this.assertRole('staff');

    await runTransaction(db, async tx => {
      const ticketRef = doc(db, TICKETS_COLLECTION, ticketId);
      const ticketSnap = await tx.get(ticketRef);

      if (!ticketSnap.exists()) {
        throw new Error('Billet introuvable.');
      }

      const ticket = ticketSnap.data() as TicketSale;

      if (ticket.status === 'cancelled') {
        throw new Error('Ce billet est déjà annulé.');
      }

      // Mise à jour atomique : statut + compteur événement
      tx.update(ticketRef, {
        status:    'cancelled',
        updatedAt: serverTimestamp(),
        cancelledBy: authService.currentUser?.uid,
      });

      // Décrémente le compteur dans la collection events
      const eventRef = doc(db, 'events', ticket.eventId);
      tx.update(eventRef, {
        [`ticketCounts.${ticket.type}`]: increment(-ticket.quantity),
        totalTicketsSold: increment(-ticket.quantity),
        totalRevenue:     increment(-ticket.total),
      });
    });
  }

  // ── Statistiques en temps réel ─────────────────────────────────────────────

  async getStats(eventId: string): Promise<{
    total: number;
    byType: Record<TicketType, number>;
    totalRevenue: number;
  }> {
    this.assertAuthenticated();

    const q = query(
      collection(db, TICKETS_COLLECTION),
      where('eventId', '==', eventId),
      where('status', '==', 'active')
    );

    const snap = await getDocs(q);
    let totalRevenue = 0;
    let total = 0;
    const byType: Record<TicketType, number> = { VIP: 0, Standard: 0, Gratuit: 0 };

    snap.forEach(d => {
      const t = d.data() as TicketSale;
      byType[t.type]  += t.quantity;
      total           += t.quantity;
      totalRevenue    += t.total;
    });

    return { total, byType, totalRevenue };
  }

  // ── Guards privés ─────────────────────────────────────────────────────────────

  private assertAuthenticated(): void {
    if (!authService.isAuthenticated) {
      throw new Error('UNAUTHENTICATED: Cette opération requiert une connexion.');
    }
  }

  private assertRole(required: 'staff' | 'admin'): void {
    const user = authService.currentUser;
    if (!user) throw new Error('UNAUTHENTICATED');

    const hasRole =
      required === 'admin'
        ? user.isAdmin
        : user.isStaff; // staff ou admin

    if (!hasRole) {
      throw new Error(`PERMISSION_DENIED: Rôle '${required}' requis.`);
    }
  }

  // ── Gestion d'erreurs ─────────────────────────────────────────────────────────

  private handleError(context: string, error: unknown): Error {
    if (error instanceof Error) {
      // Firestore renvoie des codes dans le message
      if (error.message.includes('permission-denied')) {
        return new Error('Accès refusé. Vos droits sont insuffisants.');
      }
      if (error.message.includes('unavailable')) {
        return new Error('Service temporairement indisponible. Réessayez.');
      }
      return error;
    }
    console.error(`[TicketService:${context}]`, error);
    return new Error('Erreur inconnue.');
  }
}

export const ticketService = new TicketService();
export default ticketService;
