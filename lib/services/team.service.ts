import { collection, doc, onSnapshot, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { db } from '../firebase';
import { TeamMember } from '../types';

const USERS_COLLECTION = 'users';

export const teamService = {
  getTeamMembers(): Observable<TeamMember[]> {
    return new Observable<TeamMember[]>((subscriber) => {
      const q = collection(db, USERS_COLLECTION);
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const members: TeamMember[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          members.push({
            id: doc.id,
            name: data.displayName || data.email?.split('@')[0] || 'Utilisateur anonyme',
            role: data.role || 'client',
            jobTitle: data.jobTitle || '',
            location: data.location || 'En ligne',
            isOnline: data.isOnline || false,
            tasks: data.tasks || [],
            slidesReady: data.slidesReady || false,
            email: data.email,
            phone: data.phone,
          });
        });
        subscriber.next(members);
      }, (error) => {
        subscriber.error(error);
      });

      return () => unsubscribe();
    });
  },

  async updateTeamMember(id: string, updates: Partial<TeamMember>): Promise<void> {
    const docRef = doc(db, USERS_COLLECTION, id);
    const updateData: any = { ...updates };
    delete updateData.id;
    delete updateData.email;
    delete updateData.role; 

    // Mapping fields if needed
    if (updates.name) updateData.displayName = updates.name;

    await updateDoc(docRef, updateData);
  },

  async deleteTeamMember(id: string): Promise<void> {
    const docRef = doc(db, USERS_COLLECTION, id);
    await deleteDoc(docRef);
  },

  async addTeamMember(member: TeamMember): Promise<void> {
    // This is temporary since users should be created via Auth. But we can write to 'users' if admin
    const docRef = doc(db, USERS_COLLECTION, member.id || Date.now().toString());
    await setDoc(docRef, {
      uid: docRef.id,
      displayName: member.name,
      email: member.email || '',
      role: member.role || 'team',
      location: member.location || '',
      isOnline: member.isOnline || false,
      tasks: member.tasks || [],
      slidesReady: member.slidesReady || false,
      createdAt: new Date().toISOString(),
    });
  }
};
