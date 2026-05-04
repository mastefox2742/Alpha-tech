'use client';

import { useState, useEffect } from 'react';
import { registrationService } from '@/lib/services/registration.service';
import { Registration } from '@/lib/types';
import { Input, Button, SectionCard } from '@/components/ui';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function InscriptionsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [teamsLink, setTeamsLink] = useState('');
  const [isSavingLink, setIsSavingLink] = useState(false);

  useEffect(() => {
    const sub = registrationService.getRegistrations().subscribe({
      next: (data) => setRegistrations(data),
    });
    const configSub = registrationService.getEventConfig().subscribe({
      next: (config) => {
        if (config.teamsLink) setTeamsLink(config.teamsLink);
      }
    });

    return () => {
      sub.unsubscribe();
      configSub.unsubscribe();
    };
  }, []);

  const handleLinkSave = async () => {
    try {
      setIsSavingLink(true);
      await registrationService.updateTeamsLink(teamsLink);
      alert('Lien de la masterclass mis à jour avec succès !');
    } catch (e) {
      console.error(e);
      alert('Erreur: impossible de mettre à jour le lien. Vérifiez vos permissions ou la connexion.');
    } finally {
      setIsSavingLink(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Configuration de la Masterclass">
        <label className="block text-sm font-medium text-ink mb-2">
          Lien de participation (Microsoft Teams, Zoom, etc.)
        </label>
        <div className="flex gap-4 items-center">
          <Input 
            className="flex-1"
            value={teamsLink} 
            onChange={(e) => setTeamsLink(e.target.value)} 
            placeholder="Ex: https://teams.microsoft.com/l/meetup-join/..." 
          />
          <Button variant="primary" onClick={handleLinkSave} loading={isSavingLink}>Sauvegarder</Button>
        </div>
        <p className="text-xs text-muted mt-2">Ce lien s'affichera directement aux utilisateurs après leur inscription réussie sur la plateforme publique.</p>
      </SectionCard>

      <SectionCard title={`Inscrits à la masterclass (${registrations.length})`}>
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg text-muted border-b border-border">
              <tr>
                <th className="font-medium p-3">Date</th>
                <th className="font-medium p-3">Prénom & Nom</th>
                <th className="font-medium p-3">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-muted">
                    Aucune inscription pour le moment.
                  </td>
                </tr>
              ) : (
                registrations.map(reg => (
                  <tr key={reg.id} className="hover:bg-bg/50 transition-colors">
                    <td className="p-3 text-ink">
                      {format(new Date(reg.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                    </td>
                    <td className="p-3 font-medium text-ink">
                      {reg.firstName} {reg.lastName}
                    </td>
                    <td className="p-3 font-mono text-xs text-muted">
                      {reg.email}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
