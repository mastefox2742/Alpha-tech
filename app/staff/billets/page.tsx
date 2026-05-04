'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { Button, Input, Select, SectionCard, StatsCard, Badge, EmptyState } from '@/components/ui/index';
import { useApp } from '@/contexts/AppContext';
import { generateId, formatCFA, formatDateShort, getTotalTicketsSold, getTotalTicketRevenue, getProgressPercent, ticketColors } from '@/lib/utils';
import { TicketSale, TicketType, SaleChannel } from '@/lib/types';
import { ticketService } from '@/lib/services/ticket.service';
import { toast } from 'sonner';

const TICKET_TYPES: TicketType[] = ['VIP', 'Standard', 'Gratuit'];
const CHANNELS: SaleChannel[]    = ['WhatsApp', 'Sur place', 'Facebook', 'Email', 'Partenaire'];
const PRICES: Record<TicketType, number> = { VIP: 25000, Standard: 10000, Gratuit: 0 };

export default function BilletsStaffPage() {
  const { state, dispatch } = useApp();
  const [form, setForm] = useState({
    type: 'Standard' as TicketType,
    quantity: '1',
    unitPrice: '10000',
    channel: 'WhatsApp' as SaleChannel,
    buyerName: '',
    date: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const totalSold = getTotalTicketsSold(state.ticketSales);
  const totalRev  = getTotalTicketRevenue(state.ticketSales);
  const pct       = getProgressPercent(totalSold, state.ticketTarget);

  function handleTypeChange(type: TicketType) {
    setForm(f => ({ ...f, type, unitPrice: String(PRICES[type]) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.quantity || Number(form.quantity) < 1) return;
    setSaving(true);
    try {
      const qty = Number(form.quantity);
      await ticketService.createSale({
        type: form.type,
        quantity: qty,
        channel: form.channel,
        buyerName: form.buyerName || undefined,
        eventId: 'alpha-tech-2026'
      });
      setForm(f => ({ ...f, quantity: '1', buyerName: '' }));
      setSuccess(true);
      toast.success('Vente enregistrée avec succès');
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement de la vente');
    } finally {
      setSaving(false);
    }
  }

  async function deleteSale(id: string) {
    if (confirm('Supprimer ou annuler cette vente ?')) {
      try {
        await ticketService.cancelSale(id);
        toast.success('Billet annulé');
      } catch (error) {
        toast.error('Erreur lors de l\'annulation');
      }
    }
  }

  return (
    <div className="animate-fade-in">
      <Header role="staff" title="Billets & Revenus" subtitle="Enregistrer les ventes de billets" />
      <div className="p-6 space-y-6">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard label="Vendus"        value={String(totalSold)}   icon="🎟"  color="accent" sub={`/${state.ticketTarget}`} />
          <StatsCard label="Progression"   value={`${pct}%`}           icon="📊"  color={pct >= 80 ? 'success' : 'gold'} />
          <StatsCard label="Revenus"       value={formatCFA(totalRev)} icon="💰"  color="success" />
          <StatsCard label="À vendre"      value={String(Math.max(0, state.ticketTarget - totalSold))} icon="🎯" color="info" />
        </div>

        {/* Progress */}
        <div className="bg-card border border-accent/20 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold">Progression</span>
            <Badge color={pct >= 80 ? 'success' : 'gold'}>{pct}%</Badge>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${pct}%`, background: '#1C92FF' }} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-xs font-mono uppercase tracking-wider text-highlight mb-4">➕ Nouvelle vente</p>
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Type selector */}
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-muted block mb-1.5">Type de billet</label>
                  <div className="flex gap-2">
                    {TICKET_TYPES.map(t => (
                      <button
                        key={t} type="button"
                        onClick={() => handleTypeChange(t)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                          form.type === t
                            ? 'border-current'
                            : 'border-border text-muted hover:border-muted'
                        }`}
                        style={form.type === t ? { color: ticketColors[t], background: ticketColors[t] + '15', borderColor: ticketColors[t] + '50' } : {}}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <Input label="Quantité" type="number" value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} min="1" required />
                <Input label="Prix unitaire (FCFA)" type="number" value={form.unitPrice}
                  onChange={e => setForm(f => ({ ...f, unitPrice: e.target.value }))} min="0" />
                <div className="bg-surface rounded-lg p-3 text-sm">
                  <span className="text-muted">Total : </span>
                  <span className="font-bold text-success">
                    {formatCFA(Number(form.quantity || 0) * Number(form.unitPrice || 0))}
                  </span>
                </div>
                <Select label="Canal de vente" value={form.channel}
                  onChange={e => setForm(f => ({ ...f, channel: e.target.value as SaleChannel }))}
                  options={CHANNELS.map(c => ({ value: c, label: c }))} />
                <Input label="Nom acheteur (optionnel)" value={form.buyerName}
                  onChange={e => setForm(f => ({ ...f, buyerName: e.target.value }))} placeholder="Nom ou groupe" />
                <Input label="Date" type="date" value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                <Button type="submit" loading={saving} variant={success ? 'secondary' : 'highlight'} className="w-full justify-center" icon={success ? '✓' : '🎟'}>
                  {success ? 'Enregistrée !' : 'Enregistrer la vente'}
                </Button>
              </form>
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-3">
            <SectionCard title={`📋 Ventes (${state.ticketSales.length})`}>
              {state.ticketSales.length === 0 ? (
                <EmptyState icon="🎟" message="Aucune vente" sub="Utilisez le formulaire pour en ajouter" />
              ) : (
                <div className="divide-y divide-border">
                  {[...state.ticketSales].reverse().map(t => (
                    <div key={t.id} className="flex items-center gap-3 px-4 py-3 group">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ticketColors[t.type] }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-ink">{t.type} × {t.quantity}</span>
                          {t.buyerName && <span className="text-xs text-muted">— {t.buyerName}</span>}
                        </div>
                        <p className="text-xs text-muted">{t.channel} · {formatDateShort(t.date)} · {formatCFA(t.unitPrice)}/unité</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-bold text-sm text-success">{formatCFA(t.total)}</span>
                        <button onClick={() => deleteSale(t.id)}
                          className="opacity-0 group-hover:opacity-100 text-muted hover:text-danger transition-all text-lg leading-none">×</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
