import { onRequest } from "firebase-functions/v2/https";
import { GoogleGenAI } from "@google/genai";
import { defineSecret } from "firebase-functions/params";

// Define the secret - this will be securely stored in Firebase
const geminiApiKey = defineSecret("GEMINI_API_KEY");

// Style configurations - same as frontend
const STYLE_CONFIGS: Record<string, { prompt: string; description: string }> = {
    "Modern": {
        prompt: "Virtually stage this room with high-end modern furniture. Use a clean color palette of white, grey, and black with metallic accents. Add sleek sofas, a modern coffee table, and minimalist wall art. Keep the existing walls, windows, and floors exactly as they are.",
        description: "Clean lines, sleek furniture, and a sophisticated palette."
    },
    "Rustic": {
        prompt: "Virtually stage this room in a rustic farmhouse style. Add reclaimed wood furniture, cozy textiles, warm lighting, and earth-toned upholstery. Include a sturdy wooden table or plush sofas. Maintain the integrity of the room's architecture.",
        description: "Warm, cozy, and natural wood elements."
    },
    "Scandinavian": {
        prompt: "Virtually stage this room with Scandinavian interior design. Focus on light wood, functional furniture, bright neutral colors, and plenty of natural textures like wool or linen. Add simple plants and soft lighting. Keep the walls and floors identical to the original.",
        description: "Functional, bright, and airy Nordic design."
    },
    "Industrial": {
        prompt: "Virtually stage this room with an industrial loft aesthetic. Add leather seating, metal shelving, vintage-inspired light fixtures, and a mix of wood and iron materials. Highlight the architectural space. Keep the background structures unchanged.",
        description: "Raw materials, metal accents, and urban vibes."
    },
    "Bohemian": {
        prompt: "Virtually stage this room with a Bohemian (Boho) style. Use vibrant patterns, mismatched but harmonious furniture, floor cushions, lush indoor plants, and layered rugs. Create a relaxed, eclectic atmosphere while preserving the room's bones.",
        description: "Eclectic, artistic, and colorful comfort."
    },
    "Minimalist": {
        prompt: "Virtually stage this room with a minimalist approach. Use very few, high-quality furniture pieces. Focus on open space, decluttered surfaces, and a monochromatic color scheme. The goal is serenity and simplicity. Keep walls and floors original.",
        description: "Clutter-free, serene, and essentialist."
    },
    "Empty Room (Declutter)": {
        prompt: "Remove all existing furniture, clutter, trash, and personal items from this photo. The room should appear as a professionally cleaned, completely empty space. Ensure the floors, walls, and ceiling look pristine and realistic. Do not add any new items.",
        description: "Complete decluttering for a blank canvas."
    },
    "Luxury/Glam": {
        prompt: "Virtually stage this room with ultra-luxury furniture and decor. Use velvet upholstery, marble accents, gold or brass fixtures, and grand lighting like chandeliers. Add premium rugs and high-end art. Keep the original room structure identical.",
        description: "Opulent, rich textures, and high-end elegance."
    },
    "Mid-Century Modern": {
        prompt: "Virtually stage this room with Mid-Century Modern furniture. Use teak wood pieces, organic curves, and tapered legs. Add pops of retro colors like mustard, olive, or teal. Keep the room's original structure.",
        description: "Iconic 50s/60s design with organic shapes."
    },
    "Transitional": {
        prompt: "Virtually stage this room in a Transitional style. Blend traditional and modern elements. Use neutral color palettes, comfortable upholstered furniture with simple lines, and metallic accents. Avoid excessive ornamentation. Ideally suited for standard residential homes.",
        description: "Balanced mix of classic comfort and modern lines."
    },
    "Coastal": {
        prompt: "Virtually stage this room with a Coastal aesthetic. Use a palette of whites, creams, and soft blues. Incorporate natural textures like rattan, jute, and light woods. Create a breezy, relaxed beach house feel.",
        description: "Light, breezy, and inspired by the sea."
    },
    "Modern Farmhouse": {
        prompt: "Virtually stage this room in a Modern Farmhouse style. Combine white shiplap elements (if appropriate), wrought iron accents, and warm wood textures. Use comfortable, family-friendly furniture. Chic but rustic.",
        description: "Cozy blend of modern comfort and country charm."
    },
    "Contemporary": {
        prompt: "Virtually stage this room in a Contemporary style. Focus on current trends with fluid curves, soft rounded furniture, and mixed textures. Use a sophisticated neutral palette with bold artwork.",
        description: "Current, trendy, and sophisticated."
    },
    "Traditional": {
        prompt: "Virtually stage this room in a Traditional style. Use classic furniture shapes, rich wood tones, and elegant fabrics. Create a timeless, warm, and inviting family atmosphere. Perfect for older or conventional homes.",
        description: "Timeless elegance with classic furnishings."
    },
    "Zen/Japandi": {
        prompt: "Virtually stage this room in a Zen/Japandi style. Focus on harmony, clean lines, and low-profile furniture. Use natural materials like bamboo, stone, and pale wood. Keep decorations minimal and purposeful.",
        description: "Peaceful, balanced, and minimal naturalism."
    },
    "Biophilic": {
        prompt: "Virtually stage this room with Biophilic design. Maximize the connection to nature with many indoor plants, natural light optimization, and organic materials. Create a fresh, living environment.",
        description: "Nature-focused with abundant greenery."
    },
    "Cottage Core": {
        prompt: "Virtually stage this room in a Cottage Core style. Use vintage-inspired furniture, floral patterns, and cozy layers of blankets and pillows. Create a romantic, nostalgic, and homelike feel.",
        description: "Whimsical, nostalgic, and very cozy."
    },
    "Art Deco": {
        prompt: "Virtually stage this room in Art Deco style. Use geometric patterns, bold colors, and luxurious materials like velvet and brass. Create a glamorous, vintage 1920s inspired look.",
        description: "Glamorous, geometric, and bold vintage luxury."
    }
};

const ROOM_TYPE_LABELS: Record<string, string> = {
    LIVING_ROOM: "a living room",
    BEDROOM: "a bedroom",
    KITCHEN: "a kitchen",
    DINING_ROOM: "a dining room",
    OFFICE: "a home office",
    BATHROOM: "a bathroom",
    OUTDOOR: "an outdoor patio or deck"
};

export const stageRoom = onRequest(
    {
        cors: true,
        secrets: [geminiApiKey],
        timeoutSeconds: 120,
        memory: "512MiB"
    },
    async (req, res) => {
        // Only allow POST
        if (req.method !== "POST") {
            res.status(405).json({ error: "Method not allowed" });
            return;
        }

        try {
            const { image, style, roomType, model } = req.body;

            if (!image || !style) {
                res.status(400).json({ error: "Missing required fields: image and style" });
                return;
            }

            const apiKey = geminiApiKey.value();
            if (!apiKey) {
                res.status(500).json({ error: "API key not configured" });
                return;
            }

            const ai = new GoogleGenAI({ apiKey });
            const base64Data = image.split(",")[1] || image;
            const styleConfig = STYLE_CONFIGS[style];
            const roomLabel = ROOM_TYPE_LABELS[roomType] || "a room";
            const modelName = model || "gemini-2.5-flash-image";

            if (!styleConfig) {
                res.status(400).json({ error: `Unknown style: ${style}` });
                return;
            }

            const response = await ai.models.generateContent({
                model: modelName,
                contents: {
                    parts: [
                        {
                            inlineData: {
                                data: base64Data,
                                mimeType: "image/jpeg",
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

            if (!url) {
                res.status(500).json({ error: "No image data was returned from the model." });
                return;
            }

            res.status(200).json({ url, description });
        } catch (error: unknown) {
            console.error("Staging error:", error);
            const message = error instanceof Error ? error.message : "Failed to stage the room";
            res.status(500).json({ error: message });
        }
    }
);
