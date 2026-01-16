
export enum StagingStyle {
  MODERN = 'Modern',
  RUSTIC = 'Rustic',
  SCANDINAVIAN = 'Scandinavian',
  INDUSTRIAL = 'Industrial',
  BOHEMIAN = 'Bohemian',
  MINIMALIST = 'Minimalist',
  EMPTY = 'Empty Room (Declutter)',
  LUXURY = 'Luxury/Glam'
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

export interface AppState {
  uploadedImages: UploadedImage[];
  activeImageId: string | null;
  stagedImages: StagedImage[];
  isProcessing: boolean;
  selectedStyle: StagingStyle;
  error: string | null;
}
