'use client';

import Header from '@/components/layout/Header';
import { StatsCard, SectionCard, Badge } from '@/components/ui/index';
import { useApp } from '@/contexts/AppContext';
import {
  formatCFA, formatDateShort, getTotalExpenses, getTotalRevenues,
  getNetBalance, getExpensesByCategory, categoryColors
} from '@/lib/utils';

export default function FinancesPage() {
  const { state } = useApp();
  const { expenses, ticketSales, revenues } = state;

  const totalRevenue  = getTotalRevenues(ticketSales, revenues);
  const totalExpenses = getTotalExpenses(expenses);
  const net           = getNetBalance(ticketSales, revenues, expenses);
  const byCategory    = getExpensesByCategory(expenses);

  return (
    <div className="animate-fade-in">
      <Header role="client" title="Finances" subtitle="Transparence totale en temps réel" />

      <div className="p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard label="Revenus totaux"   value={formatCFA(totalRevenue)}  icon="💰" color="success" />
          <StatsCard label="Dépenses totales" value={formatCFA(totalExpenses)} icon="💸" color="danger" />
          <StatsCard label="Solde net"        value={formatCFA(net)}           icon="⚖️" color={net >= 0 ? 'highlight' : 'danger'} />
          <StatsCard label="Transactions"     value={String(expenses.length + ticketSales.length + revenues.length)} icon="📊" color="accent" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Dépenses par catégorie */}
          <SectionCard title="💸 Dépenses par catégorie">
            <div className="p-4 space-y-3">
              {Object.entries(byCategory).map(([cat, amount]) => {
                const pct = Math.round((amount / totalExpenses) * 100);
                return (
                  <div key={cat}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-muted">{cat}</span>
                      <span className="text-xs font-mono font-semibold" style={{ color: categoryColors[cat] }}>
                        {formatCFA(amount)} · {pct}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${pct}%`, background: categoryColors[cat] }}
                      />
                    </div>
                  </div>
                );
              })}
              {Object.keys(byCategory).length === 0 && (
                <p className="text-sm text-muted text-center py-4">Aucune dépense enregistrée</p>
              )}
            </div>
          </SectionCard>

          {/* Revenus breakdown */}
          <SectionCard title="💰 Détail des revenus">
            <div className="divide-y divide-border">
              {ticketSales.map(t => (
                <div key={t.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm text-ink font-medium">Billets {t.type} × {t.quantity}</p>
                    <p className="text-xs text-muted">{t.channel} · {formatDateShort(t.date)}</p>
                  </div>
                  <span className="text-sm font-bold text-success">{formatCFA(t.total)}</span>
                </div>
              ))}
              {revenues.map(r => (
                <div key={r.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm text-ink font-medium">{r.description}</p>
                    <p className="text-xs text-muted capitalize">{r.type} · {formatDateShort(r.date)}</p>
                  </div>
                  <span className="text-sm font-bold text-success">{formatCFA(r.amount)}</span>
                </div>
              ))}
              {ticketSales.length === 0 && revenues.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-muted">Aucun revenu enregistré</div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Toutes les dépenses */}
        <SectionCard title="📋 Historique des dépenses">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Catégorie</th>
                  <th>Payé par</th>
                  <th>Date</th>
                  <th>Montant</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(e => (
                  <tr key={e.id}>
                    <td>
                      <div className="font-medium text-ink">{e.description}</div>
                      {e.notes && <div className="text-xs text-muted mt-0.5">{e.notes}</div>}
                    </td>
                    <td>
                      <span className="text-xs px-2 py-1 rounded" style={{
                        background: categoryColors[e.category] + '20',
                        color: categoryColors[e.category],
                      }}>
                        {e.category}
                      </span>
                    </td>
                    <td>{e.paidBy}</td>
                    <td className="font-mono text-xs">{formatDateShort(e.date)}</td>
                    <td className="font-bold text-danger">{formatCFA(e.amount)}</td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted">Aucune dépense enregistrée</td>
                  </tr>
                )}
              </tbody>
              {expenses.length > 0 && (
                <tfoot>
                  <tr>
                    <td colSpan={4} className="font-bold text-sm text-ink pt-3">Total</td>
                    <td className="font-bold text-danger pt-3">{formatCFA(totalExpenses)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
