'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { Button, Input, Select, Textarea, SectionCard, StatsCard, Badge, EmptyState } from '@/components/ui/index';
import { useApp } from '@/contexts/AppContext';
import { generateId, formatCFA, formatDateShort, getTotalExpenses, categoryColors } from '@/lib/utils';
import { Expense, ExpenseCategory } from '@/lib/types';
import { expenseService } from '@/lib/services/expense.service';
import { toast } from 'sonner';

const CATEGORIES: ExpenseCategory[] = [
  'Salle & Logistique', 'Transport', 'Matériel & Technique',
  'Communication & Marketing', 'Traiteur & Restauration', 'Divers',
];

const PAYERS = ['Secrétaire', 'Leader', 'Dev', 'BizDev 1', 'BizDev 2', 'Caisse commune'];

export default function DepensesPage() {
  const { state, dispatch } = useApp();
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: CATEGORIES[0],
    paidBy: PAYERS[0],
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const total = getTotalExpenses(state.expenses);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description || !form.amount) return;
    setSaving(true);
    try {
      await expenseService.addExpense({
        description: form.description,
        amount: Number(form.amount),
        category: form.category as ExpenseCategory,
        paidBy: form.paidBy,
        date: form.date,
        notes: form.notes,
      });
      setForm({ description: '', amount: '', category: CATEGORIES[0], paidBy: PAYERS[0], date: new Date().toISOString().slice(0, 10), notes: '' });
      setSuccess(true);
      toast.success('Dépense enregistrée avec succès');
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement de la dépense');
    } finally {
      setSaving(false);
    }
  }

  async function deleteExpense(id: string) {
    if (confirm('Supprimer cette dépense ?')) {
      try {
        await expenseService.deleteExpense(id);
        toast.success('Dépense supprimée');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  }

  return (
    <div className="animate-fade-in">
      <Header role="staff" title="Dépenses" subtitle="Enregistrer et suivre les sorties d'argent" />
      <div className="p-6 space-y-6">

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard label="Total dépenses" value={formatCFA(total)} icon="💸" color="danger" />
          <StatsCard label="Transactions"   value={String(state.expenses.length)} icon="📊" color="accent" />
          <StatsCard label="Budget restant" value={formatCFA(Math.max(0, state.budgetTotal - total))} icon="⚖️" color={total > state.budgetTotal * .9 ? 'danger' : 'success'} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-xs font-mono uppercase tracking-wider text-highlight mb-4">➕ Nouvelle dépense</p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  label="Description"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="ex: Location salle conférence"
                  required
                />
                <Input
                  label="Montant (FCFA)"
                  type="number"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="150000"
                  required
                  min="0"
                />
                <Select
                  label="Catégorie"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value as ExpenseCategory }))}
                  options={CATEGORIES.map(c => ({ value: c, label: c }))}
                />
                <Select
                  label="Payé par"
                  value={form.paidBy}
                  onChange={e => setForm(f => ({ ...f, paidBy: e.target.value }))}
                  options={PAYERS.map(p => ({ value: p, label: p }))}
                />
                <Input
                  label="Date"
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-muted">Notes (optionnel)</label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Acompte 50%, reçu disponible..."
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:border-highlight/50"
                    style={{ minHeight: '80px' }}
                  />
                </div>
                <Button type="submit" loading={saving} variant={success ? 'secondary' : 'highlight'} className="w-full justify-center" icon={success ? '✓' : '💾'}>
                  {success ? 'Enregistrée !' : saving ? 'Enregistrement...' : 'Enregistrer la dépense'}
                </Button>
              </form>
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-3">
            <SectionCard title={`📋 Dépenses (${state.expenses.length})`}>
              {state.expenses.length === 0 ? (
                <EmptyState icon="💸" message="Aucune dépense" sub="Utilisez le formulaire pour en ajouter" />
              ) : (
                <div className="divide-y divide-border">
                  {[...state.expenses].reverse().map(e => (
                    <div key={e.id} className="flex items-start gap-3 px-4 py-3 hover:bg-surface/40 transition-colors group">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
                        style={{ background: categoryColors[e.category] + '20' }}>
                        💸
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">{e.description}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs" style={{ color: categoryColors[e.category] }}>{e.category}</span>
                          <span className="text-xs text-muted">· {e.paidBy}</span>
                          <span className="text-xs text-muted">· {formatDateShort(e.date)}</span>
                        </div>
                        {e.notes && <p className="text-xs text-muted mt-0.5">{e.notes}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-bold text-sm text-danger">{formatCFA(e.amount)}</span>
                        <button
                          onClick={() => deleteExpense(e.id)}
                          className="opacity-0 group-hover:opacity-100 text-muted hover:text-danger transition-all text-lg leading-none"
                        >×</button>
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
