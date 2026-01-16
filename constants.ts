
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
  },
  [StagingStyle.MID_CENTURY_MODERN]: {
    prompt: "Virtually stage this room with Mid-Century Modern furniture. Use teak wood pieces, organic curves, and tapered legs. Add pops of retro colors like mustard, olive, or teal. Keep the room's original structure.",
    description: "Iconic 50s/60s design with organic shapes."
  },
  [StagingStyle.TRANSITIONAL]: {
    prompt: "Virtually stage this room in a Transitional style. Blend traditional and modern elements. Use neutral color palettes, comfortable upholstered furniture with simple lines, and metallic accents. Avoid excessive ornamentation. Ideally suited for standard residential homes.",
    description: "Balanced mix of classic comfort and modern lines."
  },
  [StagingStyle.COASTAL]: {
    prompt: "Virtually stage this room with a Coastal aesthetic. Use a palette of whites, creams, and soft blues. Incorporate natural textures like rattan, jute, and light woods. Create a breezy, relaxed beach house feel.",
    description: "Light, breezy, and inspired by the sea."
  },
  [StagingStyle.FARMHOUSE]: {
    prompt: "Virtually stage this room in a Modern Farmhouse style. Combine white shiplap elements (if appropriate), wrought iron accents, and warm wood textures. Use comfortable, family-friendly furniture. Chic but rustic.",
    description: "Cozy blend of modern comfort and country charm."
  },
  [StagingStyle.CONTEMPORARY]: {
    prompt: "Virtually stage this room in a Contemporary style. Focus on current trends with fluid curves, soft rounded furniture, and mixed textures. Use a sophisticated neutral palette with bold artwork.",
    description: "Current, trendy, and sophisticated."
  },
  [StagingStyle.TRADITIONAL]: {
    prompt: "Virtually stage this room in a Traditional style. Use classic furniture shapes, rich wood tones, and elegant fabrics. Create a timeless, warm, and inviting family atmosphere. Perfect for older or conventional homes.",
    description: "Timeless elegance with classic furnishings."
  },
  [StagingStyle.ZEN]: {
    prompt: "Virtually stage this room in a Zen/Japandi style. Focus on harmony, clean lines, and low-profile furniture. Use natural materials like bamboo, stone, and pale wood. Keep decorations minimal and purposeful.",
    description: "Peaceful, balanced, and minimal naturalism."
  },
  [StagingStyle.BIOPHILIC]: {
    prompt: "Virtually stage this room with Biophilic design. Maximize the connection to nature with many indoor plants, natural light optimization, and organic materials. Create a fresh, living environment.",
    description: "Nature-focused with abundant greenery."
  },
  [StagingStyle.COTTAGE_CORE]: {
    prompt: "Virtually stage this room in a Cottage Core style. Use vintage-inspired furniture, floral patterns, and cozy layers of blankets and pillows. Create a romantic, nostalgic, and homelike feel.",
    description: "Whimsical, nostalgic, and very cozy."
  },
  [StagingStyle.ART_DECO]: {
    prompt: "Virtually stage this room in Art Deco style. Use geometric patterns, bold colors, and luxurious materials like velvet and brass. Create a glamorous, vintage 1920s inspired look.",
    description: "Glamorous, geometric, and bold vintage luxury."
  }
};
