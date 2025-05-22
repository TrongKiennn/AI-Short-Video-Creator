import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
});
const config = {
  responseMimeType: 'application/json',
};
const model = 'gemini-2.0-flash';

export const generateScript = {
  async sendMessage(prompt) {
    const contents = [
      {
        role: 'user',
        parts: [
          { text: prompt },
        ],
      },
    ];

    const response = await ai.models.generateContent({
      model,
      config,
      contents,
    });

    // Extract the text from the Gemini response
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return { text };
  }
};