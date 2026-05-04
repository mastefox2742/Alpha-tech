import { db } from '../firebase';
import { collection, doc, query, onSnapshot, getDocs, updateDoc } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { Registration } from '../types';

class RegistrationService {
  private collectionName = 'registrations';

  // Obtenir toutes les inscriptions (temps réel)
  getRegistrations(): Observable<Registration[]> {
    return new Observable<Registration[]>((observer) => {
      const q = query(collection(db, this.collectionName));
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const registrations: Registration[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            registrations.push({
              id: doc.id,
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              email: data.email || '',
              createdAt: data.createdAt ? new Date(data.createdAt.toMillis()).toISOString() : new Date().toISOString(),
            });
          });
          // Sort by newest first
          registrations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          observer.next(registrations);
        },
        (error) => {
          console.error("Erreur lors de la récupération des inscriptions:", error);
          observer.error(error);
        }
      );

      return () => unsubscribe();
    });
  }

  // Obtenir la configuration de l'événement (comme teamsLink)
  getEventConfig(): Observable<any> {
    return new Observable<any>((observer) => {
      const q = query(collection(db, 'event_config'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            observer.next(snapshot.docs[0].data());
          } else {
            observer.next({});
          }
        },
        (error) => {
          console.error("Erreur lors de la récupération de la configuration:", error);
          observer.error(error);
        }
      );
      return () => unsubscribe();
    });
  }

  // Mettre à jour teamsLink
  async updateTeamsLink(link: string): Promise<void> {
    const q = query(collection(db, 'event_config'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const configDoc = snapshot.docs[0];
      await updateDoc(doc(db, 'event_config', configDoc.id), {
        teamsLink: link
      });
    } else {
      const { setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'event_config', 'config'), {
        teamsLink: link
      });
    }
  }
}

export const registrationService = new RegistrationService();
