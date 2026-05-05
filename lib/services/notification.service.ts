import { collection, doc, query, addDoc, updateDoc, onSnapshot, serverTimestamp, orderBy, limit, where, writeBatch } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { db } from '../firebase';
import { AppNotification } from '../types';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import app from '../firebase';

const COL = 'notifications';

function toNotif(id: string, data: Record<string, any>): AppNotification {
  return {
    id,
    title: data.title ?? '',
    message: data.message ?? '',
    type: data.type ?? 'info',
    read: data.read ?? false,
    link: data.link,
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  };
}

export const notificationService = {
  getNotifications(): Observable<AppNotification[]> {
    return new Observable<AppNotification[]>(subscriber => {
      const q = query(collection(db, COL), orderBy('createdAt', 'desc'), limit(50));
      const unsub = onSnapshot(q, snap => {
        subscriber.next(snap.docs.map(d => toNotif(d.id, d.data())));
      }, err => subscriber.error(err));
      return () => unsub();
    });
  },

  async send(notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): Promise<string> {
    const ref = await addDoc(collection(db, COL), {
      ...notif,
      read: false,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  },

  async markRead(id: string): Promise<void> {
    await updateDoc(doc(db, COL, id), { read: true });
  },

  async markAllRead(): Promise<void> {
    const q = query(collection(db, COL), where('read', '==', false));
    const snap = await import('firebase/firestore').then(m => m.getDocs(q));
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.update(d.ref, { read: true }));
    await batch.commit();
  },

  // FCM — demander la permission et récupérer le token
  async requestPushPermission(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return null;
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      if (!vapidKey) return null;
      const messaging = getMessaging(app);
      const token = await getToken(messaging, { vapidKey });
      return token;
    } catch {
      return null;
    }
  },

  // Écouter les messages FCM en foreground
  onForegroundMessage(callback: (payload: any) => void) {
    if (typeof window === 'undefined') return () => {};
    try {
      const messaging = getMessaging(app);
      return onMessage(messaging, callback);
    } catch {
      return () => {};
    }
  },
};
