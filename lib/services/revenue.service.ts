import { collection, doc, query, where, addDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { db } from '../firebase';
import { Revenue } from '../types';
import { authService } from './auth.service';

const REVENUES_COLLECTION = 'revenues';
const DEFAULT_EVENT_ID = 'alpha-tech-2026';

export const revenueService = {
  getRevenues(): Observable<Revenue[]> {
    return new Observable<Revenue[]>((subscriber) => {
      const q = query(collection(db, REVENUES_COLLECTION), where('eventId', '==', DEFAULT_EVENT_ID));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const revenues: Revenue[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          revenues.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          } as Revenue);
        });
        subscriber.next(revenues);
      }, (error) => {
        subscriber.error(error);
      });

      return () => unsubscribe();
    });
  },

  async addRevenue(revenue: Omit<Revenue, 'id' | 'createdAt'>): Promise<string> {
    const user = authService.currentUser;
    if (!user) throw new Error('Utilisateur non authentifié');

    const docRef = await addDoc(collection(db, REVENUES_COLLECTION), {
      ...revenue,
      eventId: DEFAULT_EVENT_ID,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateRevenue(id: string, revenue: Partial<Revenue>): Promise<void> {
    const docRef = doc(db, REVENUES_COLLECTION, id);
    const updateData = { ...revenue };
    delete updateData.id;
    delete updateData.createdAt;

    await updateDoc(docRef, updateData);
  },

  async deleteRevenue(id: string): Promise<void> {
    const docRef = doc(db, REVENUES_COLLECTION, id);
    await deleteDoc(docRef);
  }
};
