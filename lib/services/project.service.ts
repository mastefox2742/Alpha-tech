import { collection, doc, query, addDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { db } from '../firebase';
import { Project } from '../types';
import { authService } from './auth.service';

const COL = 'projects';

function toProject(id: string, data: Record<string, any>): Project {
  return {
    id,
    name: data.name ?? '',
    description: data.description ?? '',
    client: data.client ?? '',
    status: data.status ?? 'en_attente',
    priority: data.priority ?? 'normale',
    startDate: data.startDate ?? '',
    endDate: data.endDate ?? '',
    teamMembers: data.teamMembers ?? [],
    tasks: data.tasks ?? [],
    notes: data.notes ?? '',
    budget: data.budget,
    createdBy: data.createdBy ?? '',
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  };
}

export const projectService = {
  getProjects(): Observable<Project[]> {
    return new Observable<Project[]>(subscriber => {
      const q = query(collection(db, COL), orderBy('createdAt', 'desc'), limit(200));
      const unsub = onSnapshot(q, snap => {
        subscriber.next(snap.docs.map(d => toProject(d.id, d.data())));
      }, err => subscriber.error(err));
      return () => unsub();
    });
  },

  async addProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const user = authService.currentUser;
    if (!user) throw new Error('Non authentifié');
    const ref = await addDoc(collection(db, COL), {
      ...project,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  },

  async updateProject(id: string, data: Partial<Project>): Promise<void> {
    const { id: _id, createdAt: _ca, ...rest } = data as any;
    await updateDoc(doc(db, COL, id), { ...rest, updatedAt: serverTimestamp() });
  },

  async deleteProject(id: string): Promise<void> {
    await deleteDoc(doc(db, COL, id));
  },
};
