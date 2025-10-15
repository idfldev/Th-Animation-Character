export type ModelName = 'gemini-2.5-flash-image' | 'imagen-4.0-generate-001';

export interface Character {
  id: number;
  label: string;
  image: string | null;
  selected: boolean;
}

export interface Background {
  image: string | null;
  use: boolean;
}

export interface ImageDataPart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

export interface TextPart {
    text: string;
}