import { GeneratedSong, VocalConversionJob } from "../types";

// 1. Dynamic API URL Selection
// If REACT_APP_API_URL is set (Vercel), use it. Otherwise, default to localhost.
// Note: When using Vite, use import.meta.env.VITE_API_URL.
// For standard React scripts or this environment, process.env.REACT_APP_API_URL is common.
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Helper to check if URL is localhost
const isLocalhost = API_BASE_URL.includes("localhost");

export const generateMusic = async (lyrics: string, genre: string): Promise<GeneratedSong> => {
  try {
    console.log(`Connecting to backend at: ${API_BASE_URL}`);
    
    const response = await fetch(`${API_BASE_URL}/generate-music`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lyrics, genre })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorData.detail || `Server Error: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.warn("Backend connection failed or API error.", error);
    
    // Fallback logic for demo purposes (only if strictly necessary or requested)
    // In production, we usually want to throw the error so the UI shows the failure.
    // However, if we want to gracefully handle 'Connection Refused' on localhost:
    if (isLocalhost && error.message.includes("Failed to fetch")) {
       console.info("Falling back to demo mode due to localhost connection failure.");
       await new Promise(resolve => setTimeout(resolve, 2000)); 
       return {
         id: crypto.randomUUID(),
         url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
         status: 'completed',
         duration: 120,
         isDemo: true
       };
    }
    
    throw error;
  }
};

export const convertVocals = async (file: File, targetVoice: string): Promise<VocalConversionJob> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_voice', targetVoice);
    
    const response = await fetch(`${API_BASE_URL}/convert-vocals`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Backend API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.warn("Backend connection failed.", error);
    // Demo fallback
    await new Promise(resolve => setTimeout(resolve, 3000));
    return {
      id: crypto.randomUUID(),
      originalUrl: URL.createObjectURL(file),
      convertedUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      targetVoice,
      status: 'completed',
      isDemo: true
    };
  }
};