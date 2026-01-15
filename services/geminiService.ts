import { GoogleGenAI, Type } from "@google/genai";
import { LyricsStructure } from "../types";

// Initialize Gemini Client
// Note: In a real production app, API keys should be handled via backend proxy or secure vault.
// For this demo, we use the environment variable directly as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLyrics = async (useCase: string, genre: string): Promise<LyricsStructure> => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Write a song based on the following use case: "${useCase}".
    The genre should be: "${genre}".
    Provide a catchy Title.
    Structure the song with Verse 1, Chorus, Verse 2, Bridge, and Outro.
    Keep it rhythmic and suitable for audio generation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            style: { type: Type.STRING, description: "A brief description of the musical style/mood" },
            verse1: { type: Type.STRING },
            chorus: { type: Type.STRING },
            verse2: { type: Type.STRING },
            bridge: { type: Type.STRING },
            outro: { type: Type.STRING },
          },
          required: ["title", "style", "verse1", "chorus", "verse2", "bridge", "outro"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as LyricsStructure;
  } catch (error) {
    console.error("Error generating lyrics:", error);
    throw error;
  }
};