import React, { useState } from 'react';
import { LyricsPanel } from './components/LyricsPanel';
import { MusicPanel } from './components/MusicPanel';
import { VocalPanel } from './components/VocalPanel';
import { LyricsStructure, GeneratedSong, AppStep } from './types';
import { AudioWaveform, Music, Mic2 } from 'lucide-react';

const App: React.FC = () => {
  const [activeStep, setActiveStep] = useState<AppStep>(AppStep.LYRICS);
  const [confirmedLyrics, setConfirmedLyrics] = useState<LyricsStructure | null>(null);
  const [generatedSong, setGeneratedSong] = useState<GeneratedSong | null>(null);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <AudioWaveform className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              SonicForge AI
            </h1>
          </div>
          
          <nav className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-800">
            {[
              { id: AppStep.LYRICS, icon: Music, label: 'Lyrics' },
              { id: AppStep.MUSIC, icon: AudioWaveform, label: 'Compose' },
              { id: AppStep.VOCALS, icon: Mic2, label: 'Voice Swap' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveStep(tab.id)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeStep === tab.id 
                    ? 'bg-slate-700 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="w-8" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Workspace */}
          <div className="lg:col-span-8 space-y-8">
            {activeStep === AppStep.LYRICS && (
              <div className="animate-fade-in">
                <LyricsPanel onLyricsConfirmed={(lyrics) => {
                  setConfirmedLyrics(lyrics);
                  setActiveStep(AppStep.MUSIC);
                }} />
              </div>
            )}

            {activeStep === AppStep.MUSIC && (
              <div className="animate-fade-in">
                {confirmedLyrics ? (
                  <MusicPanel lyrics={confirmedLyrics} onSongGenerated={(song) => setGeneratedSong(song)} />
                ) : (
                  <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700 border-dashed">
                    <Music className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No Lyrics Selected</h3>
                    <p className="text-slate-400 mb-6">Generate lyrics first to compose music.</p>
                    <button 
                      onClick={() => setActiveStep(AppStep.LYRICS)}
                      className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline"
                    >
                      Go to Lyrics Engine &rarr;
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeStep === AppStep.VOCALS && (
              <div className="animate-fade-in">
                <VocalPanel />
              </div>
            )}
          </div>

          {/* Sidebar / Status */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Session Status</h3>
              
              <div className="space-y-4">
                <div className={`flex items-center gap-3 p-3 rounded-lg border ${confirmedLyrics ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-slate-900 border-slate-700'}`}>
                  <div className={`w-2 h-2 rounded-full ${confirmedLyrics ? 'bg-indigo-400' : 'bg-slate-600'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Lyrics</p>
                    <p className="text-xs text-slate-400">{confirmedLyrics ? 'Ready' : 'Not generated'}</p>
                  </div>
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg border ${generatedSong ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-slate-900 border-slate-700'}`}>
                  <div className={`w-2 h-2 rounded-full ${generatedSong ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Composition</p>
                    <p className="text-xs text-slate-400">{generatedSong ? 'Track Complete' : 'Pending'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">System Architecture</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                <strong className="text-slate-300">Frontend:</strong> React + Gemini Flash (Lyrics)<br/>
                <strong className="text-slate-300">Backend:</strong> Python FastAPI<br/>
                <strong className="text-slate-300">Music AI:</strong> Suno / MusicGen (via Replicate)<br/>
                <strong className="text-slate-300">Vocals:</strong> RVC (Retrieval-based Voice Conversion)
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;