
import { StagingStyle } from './types';

export const STYLE_CONFIGS: Record<StagingStyle, { prompt: string; description: string }> = {
  [StagingStyle.MODERN]: {
    prompt: "Virtually stage this room with high-end modern furniture. Use a clean color palette of white, grey, and black with metallic accents. Add sleek sofas, a modern coffee table, and minimalist wall art. Keep the existing walls, windows, and floors exactly as they are.",
    description: "Clean lines, sleek furniture, and a sophisticated palette."
  },
  [StagingStyle.RUSTIC]: {
    prompt: "Virtually stage this room in a rustic farmhouse style. Add reclaimed wood furniture, cozy textiles, warm lighting, and earth-toned upholstery. Include a sturdy wooden table or plush sofas. Maintain the integrity of the room's architecture.",
    description: "Warm, cozy, and natural wood elements."
  },
  [StagingStyle.SCANDINAVIAN]: {
    prompt: "Virtually stage this room with Scandinavian interior design. Focus on light wood, functional furniture, bright neutral colors, and plenty of natural textures like wool or linen. Add simple plants and soft lighting. Keep the walls and floors identical to the original.",
    description: "Functional, bright, and airy Nordic design."
  },
  [StagingStyle.INDUSTRIAL]: {
    prompt: "Virtually stage this room with an industrial loft aesthetic. Add leather seating, metal shelving, vintage-inspired light fixtures, and a mix of wood and iron materials. Highlight the architectural space. Keep the background structures unchanged.",
    description: "Raw materials, metal accents, and urban vibes."
  },
  [StagingStyle.BOHEMIAN]: {
    prompt: "Virtually stage this room with a Bohemian (Boho) style. Use vibrant patterns, mismatched but harmonious furniture, floor cushions, lush indoor plants, and layered rugs. Create a relaxed, eclectic atmosphere while preserving the room's bones.",
    description: "Eclectic, artistic, and colorful comfort."
  },
  [StagingStyle.MINIMALIST]: {
    prompt: "Virtually stage this room with a minimalist approach. Use very few, high-quality furniture pieces. Focus on open space, decluttered surfaces, and a monochromatic color scheme. The goal is serenity and simplicity. Keep walls and floors original.",
    description: "Clutter-free, serene, and essentialist."
  },
  [StagingStyle.EMPTY]: {
    prompt: "Remove all existing furniture, clutter, trash, and personal items from this photo. The room should appear as a professionally cleaned, completely empty space. Ensure the floors, walls, and ceiling look pristine and realistic. Do not add any new items.",
    description: "Complete decluttering for a blank canvas."
  },
  [StagingStyle.LUXURY]: {
    prompt: "Virtually stage this room with ultra-luxury furniture and decor. Use velvet upholstery, marble accents, gold or brass fixtures, and grand lighting like chandeliers. Add premium rugs and high-end art. Keep the original room structure identical.",
    description: "Opulent, rich textures, and high-end elegance."
  }
};
