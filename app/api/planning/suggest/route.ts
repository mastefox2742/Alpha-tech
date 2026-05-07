import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

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
    const { meetingTitle, pendingActions, previousMeetings } = await req.json();

    const client = getClient();

    const prompt = `Tu es l'assistante IA d'Alpha tech, une plateforme de gestion d'événements.

La réunion s'appelle : "${meetingTitle}"

Réunions précédentes : ${previousMeetings.length > 0 ? previousMeetings.join(', ') : 'Aucune'}

Actions en attente depuis les dernières réunions :
${pendingActions.length > 0 ? pendingActions.map((a: string) => `- ${a}`).join('\n') : '- Aucune action en attente'}

Génère un ordre du jour adapté pour cette réunion. Réponds UNIQUEMENT avec un JSON valide :
{
  "agenda": [
    "Point 1 de l'ordre du jour",
    "Point 2 de l'ordre du jour",
    "Point 3 de l'ordre du jour"
  ]
}

Règles :
- Maximum 7 points
- Commence par un tour de table rapide si c'est une réunion d'équipe
- Inclure le suivi des actions en attente si il y en a
- Finir par "Prochaines étapes et clôture"
- Les points doivent être concrets et actionnables
- Réponds UNIQUEMENT avec le JSON valide`;

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text ?? '';
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error('Planning suggestion error:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}