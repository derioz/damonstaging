
import { GoogleGenAI } from "@google/genai";
import { StagingStyle } from "../types";
import { STYLE_CONFIGS } from "../constants";

export const stageRoom = async (
  originalImageBase64: string,
  style: StagingStyle
): Promise<{ url: string; description: string }> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "PLACEHOLDER_API_KEY") {
    throw new Error("Invalid API Key. Please add your GEMINI_API_KEY to .env.local");
  }

  const ai = new GoogleGenAI({ apiKey });

  const base64Data = originalImageBase64.split(',')[1] || originalImageBase64;
  const styleConfig = STYLE_CONFIGS[style];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/jpeg',
            },
          },
          {
            text: `Act as a professional real estate staging expert. ${styleConfig.prompt}. 
            CRITICAL: You must return TWO parts in your response:
            1. A text part containing a professional 2-sentence description of the furniture and decor choices made for this staging. 
            2. An image part containing the hyper-realistic staged room.`,
          },
        ],
      },
    });

    let url = "";
    let description = "Room successfully staged with professional decor.";

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        url = `data:image/png;base64,${part.inlineData.data}`;
      } else if (part.text) {
        description = part.text.trim();
      }
    }

    if (!url) throw new Error("No image data was returned from the model.");

    return { url, description };
  } catch (error: any) {
    console.error("Gemini Staging Error:", error);
    throw new Error(error.message || "Failed to stage the room. Please try again.");
  }
};
