import { collection, doc, query, where, addDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { db } from '../firebase';
import { Meeting } from '../types';
import { authService } from './auth.service';

const MEETINGS_COLLECTION = 'meetings';
const DEFAULT_EVENT_ID = 'alpha-tech-2026';

export const meetingService = {
  getMeetings(): Observable<Meeting[]> {
    return new Observable<Meeting[]>((subscriber) => {
      const q = query(collection(db, MEETINGS_COLLECTION), where('eventId', '==', DEFAULT_EVENT_ID));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const meetings: Meeting[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          meetings.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          } as Meeting);
        });
        subscriber.next(meetings);
      }, (error) => {
        subscriber.error(error);
      });

      return () => unsubscribe();
    });
  },

  async addMeeting(meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt' | 'actions'>): Promise<string> {
    const user = authService.currentUser;
    if (!user) throw new Error('Utilisateur non authentifié');

    const docRef = await addDoc(collection(db, MEETINGS_COLLECTION), {
      ...meeting,
      actions: [],
      eventId: DEFAULT_EVENT_ID,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateMeeting(id: string, meeting: Partial<Meeting>): Promise<void> {
    const docRef = doc(db, MEETINGS_COLLECTION, id);
    const updateData = { ...meeting, updatedAt: serverTimestamp() };
    delete updateData.id;
    delete updateData.createdAt;

    await updateDoc(docRef, updateData);
  },

  async deleteMeeting(id: string): Promise<void> {
    const docRef = doc(db, MEETINGS_COLLECTION, id);
    await deleteDoc(docRef);
  }
};
