import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

function getClient() {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY non configurée');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

export async function POST(req: NextRequest) {
  try {
    const { meetingTitle, pendingActions, previousMeetings } = await req.json();

    const client = getClient();
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error('Planning suggestion error:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}