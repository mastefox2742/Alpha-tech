import { collection, doc, query, addDoc, updateDoc, onSnapshot, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { db } from '../firebase';
import { Lead } from '../types';

const COL = 'leads';

function toLead(id: string, data: Record<string, any>): Lead {
  return {
    id,
    name: data.name ?? '',
    email: data.email ?? '',
    subject: data.subject ?? '',
    message: data.message ?? '',
    status: data.status ?? 'nouveau',
    notes: data.notes ?? '',
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
  };
}

export const leadService = {
  getLeads(): Observable<Lead[]> {
    return new Observable<Lead[]>(subscriber => {
      const q = query(collection(db, COL), orderBy('createdAt', 'desc'), limit(200));
      const unsub = onSnapshot(q, snap => {
        subscriber.next(snap.docs.map(d => toLead(d.id, d.data())));
      }, err => subscriber.error(err));
      return () => unsub();
    });
  },

  async addLead(lead: Omit<Lead, 'id' | 'createdAt'>): Promise<string> {
    const ref = await addDoc(collection(db, COL), {
      ...lead,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  },

  async updateLead(id: string, data: Partial<Lead>): Promise<void> {
    const { id: _id, createdAt: _ca, ...rest } = data as any;
    await updateDoc(doc(db, COL, id), { ...rest, updatedAt: serverTimestamp() });
  },
};
