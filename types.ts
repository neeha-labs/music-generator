export interface LyricsStructure {
  title: string;
  style: string;
  content?: string; // For manual input or flattened lyrics
  verse1?: string;
  chorus?: string;
  verse2?: string;
  bridge?: string;
  outro?: string;
  source: 'ai' | 'manual';
}

export interface GeneratedSong {
  id: string;
  url: string;
  status: 'processing' | 'completed' | 'failed';
  duration: number;
  isDemo?: boolean;
}

export interface VocalConversionJob {
  id: string;
  originalUrl: string;
  convertedUrl?: string;
  targetVoice: string;
  status: 'processing' | 'completed' | 'failed';
  isDemo?: boolean;
}

export enum AppStep {
  LYRICS = 'LYRICS',
  MUSIC = 'MUSIC',
  VOCALS = 'VOCALS'
}