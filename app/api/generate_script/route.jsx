import { generateScript } from '@/configs/AiModel';
import { NextResponse } from 'next/server';
const SCRIPT_PROMPT = `write a two different script for 60 Seconds video on Topic:{topic},
Do not add Scene description
Do not Add Anything in Braces, Just return the plain story in text
Give me response in JSON format and follow the schema
-{
scripts:[
{
content:"
},
],
}`;
export async function POST(req) {
  try {
    const { topic, writingStyle } = await req.json();

    let PROMPT = SCRIPT_PROMPT.replace('{topic}', topic);

    // Add writing style if provided
    if (writingStyle && writingStyle.trim() !== '') {
      PROMPT += `\nWrite with "${writingStyle}" writing style,
\nif the provided word is not in English, make best efforts to translate it to English,
\nif the writing style makes no sense or unfeasible, just give me plain text and nothing else,
\nreturn in english please`;
    }

    const result = await generateScript.sendMessage(PROMPT);
    return NextResponse.json(JSON.parse(result.text));
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: e.message });
  }
}
