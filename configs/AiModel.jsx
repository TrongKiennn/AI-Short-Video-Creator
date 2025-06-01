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

export const generateImageScript = {
  async sendMessage(prompt) {
    const contents = [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
      {
        role: 'model',
        parts: [{
          text: `[
            {
              "imagePrompt": "Close-up of a weathered hand holding a worn leather-bound book, dust motes dancing in the sunlight. Ancient symbols etched into the cover are barely visible.",
              "sceneContent": "<Script Content: Establishing shot. Focus on the ancient book.>"
            },
            {
              "imagePrompt": "A bustling marketplace filled with colorful stalls, exotic spices, and diverse people. Merchants hawk their wares, and children chase pigeons through the crowd.",
              "sceneContent": "<Script Content: Market scene. Introduce the vibrant world.>"
            },
            {
              "imagePrompt": "A mysterious figure cloaked in shadows standing at the edge of the marketplace, observing the protagonist with piercing eyes. A sense of danger and intrigue fills the air.",
              "sceneContent": "<Script Content: Introduction of the antagonist. Ominous presence.>"
            },
            {
              "imagePrompt": "The protagonist engrossed in reading the ancient book by candlelight in a dimly lit study. Maps and scrolls surround them, hinting at a grand quest.",
              "sceneContent": "<Script Content: Protagonist's research. Focus on the book's importance.>"
            },
            {
              "imagePrompt": "A perilous journey through a dense, ancient forest. Sunlight filters through the canopy, illuminating the path ahead. The protagonist faces unknown dangers.",
              "sceneContent": "<Script Content: The journey begins. Facing challenges in the forest.>"
            },
            {
              "imagePrompt": "A hidden chamber within a crumbling temple. Walls adorned with hieroglyphs, and a single beam of light illuminating a golden artifact.",
              "sceneContent": "<Script Content: Discovery of the artifact. Climax of the scene.>"
            },
            {
              "imagePrompt": "The antagonist confronts the protagonist in the chamber, a battle of wits and power ensues. Sparks fly as their destinies collide.",
              "sceneContent": "<Script Content: Confrontation with the antagonist. High-stakes battle.>"
            },
            {
              "imagePrompt": "The protagonist emerges victorious from the temple, holding the artifact aloft. A new chapter dawns as they embrace their destiny.",
              "sceneContent": "<Script Content: Resolution. The protagonist's victory and future.>"
            }
          ]`
        }],
      },
    ];

    const response = await ai.models.generateContent({
      model,
      config,
      contents,
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return { text };
  }
};