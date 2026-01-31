
export interface BookAnalysis {
  title: string;
  author: string;
  utilityScore: number;
  benefits: string[];
  targetAge: string;
  stats: {
    label: string;
    value: string;
  }[];
  summary: string;
}

export type Language = 'ar' | 'en';

export interface TranslationStrings {
  appName: string;
  heroTitle: string;
  heroSub: string;
  scanNow: string;
  allowCamera: string;
  analyzing: string;
  utilityScore: string;
  benefits: string;
  targetAge: string;
  stats: string;
  author: string;
  capturePhoto: string;
  retake: string;
  langToggle: string;
  loadingMessages: string[];
  unrecognizedError: string;
  genericError: string;
  trustIndicator: string;
  scanNew: string;
  copyright: string;
  cameraInstruction: string;
  aiProcessing: string;
}