
export enum StagingStyle {
  MODERN = 'Modern',
  RUSTIC = 'Rustic',
  SCANDINAVIAN = 'Scandinavian',
  INDUSTRIAL = 'Industrial',
  BOHEMIAN = 'Bohemian',
  MINIMALIST = 'Minimalist',
  EMPTY = 'Empty Room (Declutter)',
  LUXURY = 'Luxury/Glam',
  MID_CENTURY_MODERN = 'Mid-Century Modern',
  TRANSITIONAL = 'Transitional',
  COASTAL = 'Coastal',
  FARMHOUSE = 'Modern Farmhouse',
  CONTEMPORARY = 'Contemporary',
  TRADITIONAL = 'Traditional',
  ZEN = 'Zen/Japandi',
  BIOPHILIC = 'Biophilic',
  COTTAGE_CORE = 'Cottage Core',
  ART_DECO = 'Art Deco'
}

export interface StagedImage {
  id: string;
  originalImageId: string;
  url: string;
  description: string;
  style: StagingStyle;
  timestamp: number;
}

export interface UploadedImage {
  id: string;
  url: string;
  timestamp: number;
}

export type GeminiModel = 'gemini-2.0-flash-exp' | 'gemini-1.5-pro';

export interface AppState {
  uploadedImages: UploadedImage[];
  activeImageId: string | null;
  stagedImages: StagedImage[];
  isProcessing: boolean;
  selectedStyle: StagingStyle;
  selectedRoomType: string;
  selectedModel: GeminiModel;
  error: string | null;
}
