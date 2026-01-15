import React, { useState, useEffect } from 'react';
import { LyricsStructure, GeneratedSong } from '../types';
import { generateMusic } from '../services/backendService';
import { Play, Square, Loader2, Music, FileText, AlertCircle, Info, Coffee } from 'lucide-react';

interface MusicPanelProps {
  lyrics: LyricsStructure;
  onSongGenerated: (song: GeneratedSong) => void;
}

export const MusicPanel: React.FC<MusicPanelProps> = ({ lyrics, onSongGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false); // New state for cold start
  const [song, setSong] = useState<GeneratedSong | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateMusic = async () => {
    setIsGenerating(true);
    setError(null);
    setIsWakingUp(false);

    // If request takes longer than 3 seconds, assume server is waking up
    const wakingUpTimer = setTimeout(() => {
        setIsWakingUp(true);
    }, 3000);

    try {
      // Determine prompt content
      let fullText = "";
      if (lyrics.source === 'manual' && lyrics.content) {
        fullText = `${lyrics.title}\n\n${lyrics.content}`;
      } else {
        const parts = [
          lyrics.title,
          lyrics.verse1,
          lyrics.chorus,
          lyrics.verse2,
          lyrics.bridge,
          lyrics.outro
        ].filter(Boolean);
        fullText = parts.join('\n\n');
      }

      const result = await generateMusic(fullText, lyrics.style);
      setSong(result);
      onSongGenerated(result);
    } catch (err: any) {
      console.error(err);
      let errorMessage = "Failed to generate music.";
      if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      clearTimeout(wakingUpTimer);
      setIsGenerating(false);
      setIsWakingUp(false);
    }
  };

  const togglePlay = () => {
    if (!song) return;

    if (!audio) {
      const newAudio = new Audio(song.url);
      newAudio.onended = () => setIsPlaying(false);
      newAudio.play();
      setAudio(newAudio);
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
       <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-500/20 rounded-lg">
          <Music className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Music Generator</h2>
          <p className="text-slate-400 text-sm">Lyrics-to-Audio Synthesis (MusicGen)</p>
        </div>
      </div>

      <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 mb-6 flex items-start gap-4">
        <div className="p-2 bg-slate-800 rounded border border-slate-700 hidden sm:block">
           <FileText className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-400">Selected Source</h3>
          <p className="text-white font-bold text-lg truncate">{lyrics.title}</p>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
               {lyrics.style}
             </span>
             <span className="text-xs text-slate-500">
               {lyrics.source === 'ai' ? 'AI Generated' : 'Manual Input'}
             </span>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-red-200">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-sm text-red-400">Generation Error</h4>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Cold Start Warning */}
      {isWakingUp && isGenerating && (
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3 text-blue-200 animate-pulse">
          <Coffee className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-sm text-blue-400">Waking up the backend...</h4>
            <p className="text-sm mt-1">
              Servers on the free tier go to sleep after inactivity. This first request might take about 60 seconds. Hang tight!
            </p>
          </div>
        </div>
      )}

      {song?.isDemo && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3 text-yellow-200">
           <Info className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
           <div className="flex-1">
             <h4 className="font-bold text-sm text-yellow-400">Demo Mode Active</h4>
             <p className="text-sm mt-1">
               Using localhost but backend is unreachable. Playing placeholder audio.
             </p>
           </div>
        </div>
      )}

      {!song ? (
         <button
         onClick={handleGenerateMusic}
         disabled={isGenerating}
         className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-3"
       >
         {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Music className="w-6 h-6" />}
         {isGenerating ? 'Composing Track...' : 'Generate Full Track'}
       </button>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <div className="relative group bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
             <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-emerald-500/10" />
             <div className="p-8 flex flex-col items-center justify-center gap-4 relative z-10">
                <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center shadow-2xl border-4 border-slate-700">
                   <Music className={`w-12 h-12 text-indigo-400 ${isPlaying ? 'animate-pulse' : ''}`} />
                </div>
                <h3 className="text-xl font-bold text-white">{lyrics.title}</h3>
                <div className="flex gap-4">
                  <button 
                    onClick={togglePlay}
                    className="w-14 h-14 bg-indigo-500 hover:bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95"
                  >
                    {isPlaying ? <Square className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                  </button>
                </div>
             </div>
             
             {/* Progress Bar Visual (Mock) */}
             <div className="h-1 bg-slate-800 w-full mt-auto">
                <div className={`h-full bg-indigo-500 transition-all duration-1000 ${isPlaying ? 'w-full' : 'w-0'}`} style={{ transitionDuration: isPlaying ? `${song.duration}s` : '0s' }} />
             </div>
          </div>
          
          <button
             onClick={() => { setSong(null); setError(null); }}
             className="w-full text-slate-400 text-sm hover:text-white hover:underline"
           >
             Generate Another Version
           </button>
        </div>
      )}
    </div>
  );
};