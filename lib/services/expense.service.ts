import { collection, doc, query, where, getDocs, addDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { db } from '../firebase';
import { Expense } from '../types';
import { authService } from './auth.service';

const EXPENSES_COLLECTION = 'expenses';
const DEFAULT_EVENT_ID = 'alpha-tech-2026';

export const expenseService = {
  getExpenses(): Observable<Expense[]> {
    return new Observable<Expense[]>((subscriber) => {
      const q = query(collection(db, EXPENSES_COLLECTION), where('eventId', '==', DEFAULT_EVENT_ID));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const expenses: Expense[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          expenses.push({
            id: doc.id,
            description: data.description,
            amount: data.amount,
            category: data.category,
            paidBy: data.paidBy,
            date: data.date,
            receiptUrl: data.receiptUrl,
            notes: data.notes,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          } as Expense);
        });
        subscriber.next(expenses);
      }, (error) => {
        subscriber.error(error);
      });

      return () => unsubscribe();
    });
  },

  async addExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Promise<string> {
    const user = authService.currentUser;
    if (!user) throw new Error('Utilisateur non authentifié');

    const docRef = await addDoc(collection(db, EXPENSES_COLLECTION), {
      ...expense,
      eventId: DEFAULT_EVENT_ID,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateExpense(id: string, expense: Partial<Expense>): Promise<void> {
    const docRef = doc(db, EXPENSES_COLLECTION, id);
    const updateData = { ...expense, updatedAt: serverTimestamp() };
    delete updateData.id;
    delete updateData.createdAt;

    await updateDoc(docRef, updateData);
  },

  async deleteExpense(id: string): Promise<void> {
    const docRef = doc(db, EXPENSES_COLLECTION, id);
    await deleteDoc(docRef);
  }
};
