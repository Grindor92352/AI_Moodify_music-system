import axios from 'axios';

export interface Song {
  videoId: string;
  title: string;
  artist: string;
}

export interface MusicRefreshResponse {
  mood: string;
  songs: Song[];
  videoIds: string[];
}

export interface MusicAnalyzeResponse {
  mood?: string;
  dominant_mood?: string;
  songs?: Song[];
  videoIds?: string[];
  error?: string;
}

export interface HistoryEntry {
  id: number;
  mood: string;
  songs?: Song[];
  videoIds?: string[];
  date: string;
  tracks?: number;
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string } | undefined;
    return data?.error ?? err.message ?? fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
