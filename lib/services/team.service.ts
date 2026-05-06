import { collection, doc, onSnapshot, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Observable } from 'rxjs';
import { db, storage } from '../firebase';
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
            id:          doc.id,
            name:        data.displayName || data.email?.split('@')[0] || 'Utilisateur',
            role:        data.role        || 'client',
            jobTitle:    data.jobTitle    || '',
            location:    data.location    || 'En ligne',
            isOnline:    data.isOnline    || false,
            tasks:       data.tasks       || [],
            slidesReady: data.slidesReady || false,
            email:       data.email,
            phone:       data.phone,
            photoURL:    data.photoURL    || null,
          });
        });
        subscriber.next(members);
      }, (error) => {
        subscriber.error(error);
      });
      return () => unsubscribe();
    });
  },

  // Upload photo vers Firebase Storage, retourne l'URL publique
  async uploadPhoto(uid: string, file: File): Promise<string> {
    const photoRef = ref(storage, `avatars/${uid}`);
    await uploadBytes(photoRef, file);
    return getDownloadURL(photoRef);
  },

  // Mise à jour du profil (jobTitle + photoURL) — utilisable par le membre lui-même ou un admin
  async updateProfile(uid: string, data: { jobTitle?: string; photoURL?: string }): Promise<void> {
    await updateDoc(doc(db, USERS_COLLECTION, uid), data as Record<string, unknown>);
  },

  // Changement de rôle — admin uniquement (les Firestore Rules l'appliquent)
  async changeRole(uid: string, role: string): Promise<void> {
    await updateDoc(doc(db, USERS_COLLECTION, uid), { role });
  },

  async updateTeamMember(id: string, updates: Partial<TeamMember>): Promise<void> {
    const docRef = doc(db, USERS_COLLECTION, id);
    const updateData: Record<string, unknown> = { ...updates };
    delete updateData['id'];
    delete updateData['email'];
    if (updates.name) updateData['displayName'] = updates.name;
    await updateDoc(docRef, updateData);
  },

  async deleteTeamMember(id: string): Promise<void> {
    await deleteDoc(doc(db, USERS_COLLECTION, id));
  },

  async addTeamMember(member: TeamMember): Promise<void> {
    const docRef = doc(db, USERS_COLLECTION, member.id || Date.now().toString());
    await setDoc(docRef, {
      uid:         docRef.id,
      displayName: member.name,
      email:       member.email    || '',
      role:        member.role     || 'team',
      jobTitle:    member.jobTitle || '',
      location:    member.location || '',
      isOnline:    member.isOnline || false,
      tasks:       member.tasks    || [],
      slidesReady: member.slidesReady || false,
      createdAt:   new Date().toISOString(),
    });
  },
};