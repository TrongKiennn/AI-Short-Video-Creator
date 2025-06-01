import { generateScript } from "@/configs/AiModel";
import { NextResponse } from "next/server";
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
    const { topic } = await req.json();

    const PROMPT = SCRIPT_PROMPT.replace("{topic}", topic);
    const result = await generateScript.sendMessage(PROMPT);
    return NextResponse.json(JSON.parse(result.text));
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: e.message });
  }
}
