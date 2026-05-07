import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { GeneratedSummary } from '@/lib/types';

let ai: GoogleGenAI | null = null;

function getClient() {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY non configurée');
    }
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
}

export async function POST(req: NextRequest) {
  try {
    const { meetingTitle, agenda, participants, rawNotes } = await req.json();

    const client = getClient();

    const prompt = `Tu es l'assistante IA d'Alpha tech. Analyse les notes brutes de cette réunion et génère un compte rendu structuré.

RÉUNION : ${meetingTitle}
PARTICIPANTS : ${participants.join(', ')}
ORDRE DU JOUR : ${agenda.join(', ')}

NOTES BRUTES :
${rawNotes}

Génère un JSON avec cette structure EXACTE (rien d'autre, pas de balises markdown) :
{
  "summary": "Résumé de 2-3 phrases de la réunion",
  "decisions": ["Décision 1", "Décision 2"],
  "actions": [
    {
      "description": "Ce qui doit être fait",
      "assignedTo": "Nom de la personne",
      "dueDate": "YYYY-MM-DD"
    }
  ]
}

Règles :
- Extrait TOUTES les décisions prises
- Extrait TOUTES les actions mentionnées (qui fait quoi)
- Pour les dates : si aucune date mentionnée, mets une date raisonnable dans 2 semaines
- Réponds UNIQUEMENT avec le JSON valide, rien d'autre`;

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text ?? '';
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed: GeneratedSummary = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error('Notes generation error:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}