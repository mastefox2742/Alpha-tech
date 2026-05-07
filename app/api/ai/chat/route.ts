import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

let client: GoogleGenAI | null = null;

function getClient() {
  if (!client) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY non configurée dans les variables d\'environnement');
    }
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

export async function POST(req: NextRequest) {
  try {
    const { systemContext, messages } = await req.json();

    const aiClient = getClient();

    const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1];

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: lastMessage.content }] },
      ],
      config: {
        systemInstruction: systemContext,
        maxOutputTokens: 1024,
      },
    });

    if (!response.text) {
      return NextResponse.json({ error: 'Unexpected response' }, { status: 500 });
    }

    return NextResponse.json({ content: response.text });
  } catch (error: unknown) {
    console.error('AI Chat error:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}