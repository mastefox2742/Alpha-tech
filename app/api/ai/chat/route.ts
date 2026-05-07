import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

let ai: GoogleGenAI | null = null;

function getClient() {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY non configurée dans les variables d\'environnement');
    }
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
}

export async function POST(req: NextRequest) {
  try {
    const { systemContext, messages } = await req.json();

    const client = getClient();

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      config: { systemInstruction: systemContext },
      contents: messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    });

    const text = response.text ?? '';
    return NextResponse.json({ content: text });
  } catch (error: unknown) {
    console.error('AI Chat error:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}