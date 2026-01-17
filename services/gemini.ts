
import { GoogleGenAI } from "@google/genai";
import { StagingStyle } from "../types";
import { STYLE_CONFIGS } from "../constants";

const ROOM_TYPE_LABELS: Record<string, string> = {
  LIVING_ROOM: 'a living room',
  BEDROOM: 'a bedroom',
  KITCHEN: 'a kitchen',
  DINING_ROOM: 'a dining room',
  OFFICE: 'a home office',
  BATHROOM: 'a bathroom',
  OUTDOOR: 'an outdoor patio or deck'
};

export const stageRoom = async (
  originalImageBase64: string,
  style: StagingStyle,
  roomType: string = 'LIVING_ROOM',
  model: string = 'gemini-2.5-flash-image'
): Promise<{ url: string; description: string }> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "PLACEHOLDER_API_KEY") {
    throw new Error("Invalid API Key. Please add your GEMINI_API_KEY to .env.local");
  }

  const ai = new GoogleGenAI({ apiKey });

  const base64Data = originalImageBase64.split(',')[1] || originalImageBase64;
  const styleConfig = STYLE_CONFIGS[style];
  const roomLabel = ROOM_TYPE_LABELS[roomType] || 'a room';

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/jpeg',
            },
          },
          {
            text: `Act as a professional real estate virtual staging expert. This image is ${roomLabel}. 

IMPORTANT STRUCTURAL PRESERVATION RULES:
- DO NOT modify, alter, or change: walls, ceilings, floors, doors, windows, moldings, light fixtures, outlets, vents, built-in cabinetry, or any architectural elements.
- ONLY add or replace: furniture, rugs, artwork, decorative items, plants, and soft furnishings (pillows, throws, curtains).
- The room's structure, paint colors, flooring material, and architectural details must remain EXACTLY as shown in the original photo.

${styleConfig.prompt}

CRITICAL OUTPUT REQUIREMENTS:
1. Return a TEXT part: A professional 2-sentence description of the furniture and decor choices made.
2. Return an IMAGE part: The hyper-realistic staged room with furniture added but structure unchanged.`,
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
