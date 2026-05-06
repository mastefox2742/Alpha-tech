'use client';

import { useState, useRef, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/index';
import { useApp } from '@/contexts/AppContext';
import { generateId, formatCFA, getTotalExpenses, getTotalRevenues, getTotalTicketsSold } from '@/lib/utils';
import { ChatMessage } from '@/lib/types';

const SUGGESTIONS = [
  'Résume la dernière réunion',
  'Génère un ordre du jour pour la prochaine réunion',
  'Quelles dépenses ont été enregistrées cette semaine ?',
  'Combien de billets nous reste-t-il à vendre ?',
  'Rédige un email de convocation pour samedi à 14h',
  'Quelles actions ne sont pas encore complétées ?',
  'Donne-moi un résumé financier complet',
  'Génère un compte rendu de réunion factice pour test',
];

export default function AssistantPage() {
  const { state } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Bonjour ! Je suis votre assistante IA Alpha tech. 🤖\n\nJe connais toutes les données de votre événement :\n- **${state.meetings.length}** réunion(s) dans la base\n- **${getTotalTicketsSold(state.ticketSales)}** billets vendus\n- **${formatCFA(getTotalExpenses(state.expenses))}** de dépenses\n- **J-${Math.max(0, Math.ceil((new Date(state.eventDate).getTime() - Date.now()) / 86400000))}** avant l'événement\n\nComment puis-je vous aider ?`,
      createdAt: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Build context from app state
  function buildContext() {
    const totalExp = getTotalExpenses(state.expenses);
    const totalRev = getTotalRevenues(state.ticketSales, state.revenues);
    const ticketsSold = getTotalTicketsSold(state.ticketSales);
    const pendingActions = state.meetings.flatMap(m => m.actions).filter(a => !a.completed);

    return `
Tu es l'assistante IA d'Alpha tech, plateforme de gestion de l'événement "${state.eventName}" prévu le ${state.eventDate}.

=== CONTEXTE ÉVÉNEMENT ===
Nom : ${state.eventName}
Date : ${state.eventDate}
Budget total : ${formatCFA(state.budgetTotal)}
Objectif billets : ${state.ticketTarget}

=== FINANCES ===
Revenus totaux : ${formatCFA(totalRev)}
Dépenses totales : ${formatCFA(totalExp)}
Solde net : ${formatCFA(totalRev - totalExp)}
Billets vendus : ${ticketsSold}/${state.ticketTarget}

=== DÉPENSES (${state.expenses.length}) ===
${state.expenses.map(e => `- ${e.description} : ${formatCFA(e.amount)} (${e.category}, payé par ${e.paidBy})`).join('\n') || 'Aucune'}

=== VENTES BILLETS (${state.ticketSales.length}) ===
${state.ticketSales.map(t => `- ${t.type} × ${t.quantity} via ${t.channel} : ${formatCFA(t.total)}`).join('\n') || 'Aucune'}

=== RÉUNIONS (${state.meetings.length}) ===
${state.meetings.map(m => `- ${m.title} (${m.date} ${m.time}) — Statut : ${m.status}\n  Résumé : ${m.summary || 'pas encore disponible'}`).join('\n\n') || 'Aucune'}

=== ACTIONS EN ATTENTE (${pendingActions.length}) ===
${pendingActions.map(a => `- ${a.description} → ${a.assignedTo} avant ${a.dueDate}`).join('\n') || 'Aucune'}

=== ÉQUIPE ===
${state.teamMembers.map(m => `- ${m.name} (${m.role}) — Slides : ${m.slidesReady ? 'Prêtes ✓' : 'En cours'}`).join('\n')}

Réponds toujours en français, de manière claire et utile. Tu peux utiliser du markdown basique (**gras**, listes). Sois concise et pratique.
    `.trim();
  }

  async function sendMessage(content?: string) {
    const text = (content ?? input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { id: generateId(), role: 'user', content: text, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemContext: buildContext(),
          messages: [...history, { role: 'user', content: text }],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Erreur HTTP ${res.status}`);
      const { content: reply } = data;

      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: reply,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'assistant',
        content: `❌ ${errorMsg}`,
        createdAt: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  }

  function renderLine(line: string, i: number) {
    const parts = line.replace(/\r/g, '').split(/\*\*(.*?)\*\*/g);
    const nodes = parts.map((part, j) =>
      j % 2 === 1 ? <strong key={j}>{part}</strong> : part
    );
    if (line.startsWith('- ') || line.startsWith('• ')) {
      return <li key={i} className="ml-4">{nodes}</li>;
    }
    return <p key={i} className={line === '' ? 'h-2' : ''}>{nodes}</p>;
  }

  function renderContent(content: string) {
    return content.split('\n').map((line, i) => renderLine(line, i));
  }

  return (
    <div className="animate-fade-in flex flex-col h-screen">
      <Header role="staff" title="Assistant IA" subtitle="Propulsé par Claude · Anthropic" />

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="p-4 border-b border-border">
          <p className="text-xs font-mono uppercase tracking-wider text-muted mb-2">Suggestions</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => sendMessage(s)}
                className="text-xs bg-surface border border-border hover:border-highlight/40 hover:bg-highlight/5 hover:text-highlight text-muted rounded-lg px-3 py-1.5 transition-all">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-accent text-white'
                : 'bg-card border border-border text-ink'
            }`}>
              {m.role === 'assistant' ? (
                <div className="space-y-1 leading-relaxed">
                  {renderContent(m.content)}
                </div>
              ) : (
                <p>{m.content}</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 text-muted text-sm">
                <div className="w-2 h-2 rounded-full bg-highlight animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-highlight animate-pulse" style={{ animationDelay: '0.15s' }} />
                <div className="w-2 h-2 rounded-full bg-highlight animate-pulse" style={{ animationDelay: '0.3s' }} />
                <span className="text-xs ml-1">Claude réfléchit...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-surface/60">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
            placeholder="Posez votre question... (Entrée pour envoyer)"
            disabled={loading}
            className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm text-ink
              placeholder:text-muted/50 focus:outline-none focus:border-highlight/50 transition-colors"
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            loading={loading}
            variant="highlight"
            className="px-5"
            icon="→"
          >
            Envoyer
          </Button>
        </div>
        <p className="text-xs text-muted mt-2 text-center">
          L&apos;IA connaît toutes vos données en temps réel · Propulsé par Claude (Anthropic)
        </p>
      </div>
    </div>
  );
}
