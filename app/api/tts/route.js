import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import { promises as fs } from 'fs';
import path from 'path';

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  dangerouslyAllowBrowser: false
});

export async function GET(request) {
  const voices = [
    { value: 'Fritz-PlayAI', label: 'Fritz (Male)', lang: 'en' },
    { value: 'Aaliyah-PlayAI', label: 'Aaliyah (Female)', lang: 'en' }
  ];
  const url = new URL(request.url, 'http://localhost');
  const lang = url.searchParams.get('lang');
  const filtered = lang ? voices.filter(v => v.lang === lang) : voices;
  return NextResponse.json({ voices: filtered });
}

export async function POST(request) {
  try {
    const { text, voice, lang } = await request.json();
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }
    const selectedVoice = voice || 'Fritz-PlayAI';

    const speechFileName = `speech-${Date.now()}.wav`;
    const speechFilePath = path.join(process.cwd(), 'public', speechFileName);

    const response = await client.audio.speech.create({
      model: "playai-tts",
      voice: selectedVoice,
      input: text,
      response_format: 'wav'
    });

    await fs.writeFile(speechFilePath, Buffer.from(await response.arrayBuffer()));

    return NextResponse.json({ audioUrl: `/${speechFileName}` });
  } catch (error) {
    console.error('Groq TTS Error:', error);
    return NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 });
  }
}
