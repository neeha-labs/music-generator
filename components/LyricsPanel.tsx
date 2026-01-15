import React, { useState, useRef } from 'react';
import { generateLyrics } from '../services/geminiService';
import { LyricsStructure } from '../types';
import { Loader2, Music2, Wand2, Upload, FileText, PenTool } from 'lucide-react';

interface LyricsPanelProps {
  onLyricsConfirmed: (lyrics: LyricsStructure) => void;
}

const GENRES = [
  "Pop", "Kids Song", "Nursery Rhyme", "Lullaby", 
  "Jazz", "Rock", "Hip Hop", "Country", 
  "Electronic", "Cinematic Score", "Reggae"
];

export const LyricsPanel: React.FC<LyricsPanelProps> = ({ onLyricsConfirmed }) => {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  
  // AI State
  const [useCase, setUseCase] = useState('');
  const [genre, setGenre] = useState('Pop');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLyrics, setGeneratedLyrics] = useState<LyricsStructure | null>(null);

  // Manual State
  const [manualTitle, setManualTitle] = useState('');
  const [manualLyrics, setManualLyrics] = useState('');
  const [manualGenre, setManualGenre] = useState('Kids Song');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!useCase) return;
    setIsLoading(true);
    try {
      const result = await generateLyrics(useCase, genre);
      setGeneratedLyrics({ ...result, source: 'ai' });
    } catch (error) {
      alert("Failed to generate lyrics. Check console/API Key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setManualLyrics(text);
        // Try to infer title from filename
        if (!manualTitle) {
          setManualTitle(file.name.replace(/\.[^/.]+$/, ""));
        }
      }
    };
    reader.readAsText(file);
  };

  const handleManualSubmit = () => {
    if (!manualTitle || !manualLyrics) return;
    onLyricsConfirmed({
      title: manualTitle,
      style: manualGenre,
      content: manualLyrics,
      source: 'manual'
    });
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/20 rounded-lg">
            {mode === 'ai' ? (
              <Wand2 className="w-6 h-6 text-indigo-400" />
            ) : (
              <PenTool className="w-6 h-6 text-indigo-400" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Lyrics Studio</h2>
            <p className="text-slate-400 text-sm">
              {mode === 'ai' ? 'Powered by Gemini 3 Flash' : 'Write or upload your own lyrics'}
            </p>
          </div>
        </div>

        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setMode('ai')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mode === 'ai' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            AI Generator
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mode === 'manual' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Manual / Upload
          </button>
        </div>
      </div>

      {mode === 'ai' ? (
        // AI MODE
        <div className="space-y-4 animate-fade-in">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              What's the song about? (Use Case)
            </label>
            <textarea
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none h-24 resize-none"
              placeholder="E.g., A rhyming song about a little dinosaur learning to share..."
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Musical Style / Genre
            </label>
            <select
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            >
              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !useCase}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
            {isLoading ? 'Dreaming up lyrics...' : 'Generate Lyrics'}
          </button>

          {generatedLyrics && (
            <div className="mt-8 animate-fade-in border-t border-slate-700 pt-6">
              <div className="bg-slate-900 rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto border border-slate-700/50">
                <div className="text-center pb-4 border-b border-slate-800">
                  <h4 className="text-xl font-bold text-indigo-400">{generatedLyrics.title}</h4>
                  <span className="text-xs text-slate-500">{generatedLyrics.style}</span>
                </div>
                
                {[
                  { label: 'Verse 1', content: generatedLyrics.verse1 },
                  { label: 'Chorus', content: generatedLyrics.chorus },
                  { label: 'Verse 2', content: generatedLyrics.verse2 },
                  { label: 'Bridge', content: generatedLyrics.verse3 }, // Typo safety in display if exists
                  { label: 'Bridge', content: generatedLyrics.bridge },
                  { label: 'Outro', content: generatedLyrics.outro }
                ].map((part, idx) => part.content ? (
                  <div key={idx} className="space-y-1">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">{part.label}</span>
                    <p className="text-slate-300 whitespace-pre-line leading-relaxed">{part.content}</p>
                  </div>
                ) : null)}
              </div>

              <button
                onClick={() => onLyricsConfirmed(generatedLyrics)}
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Music2 className="w-5 h-5" />
                Use Generated Lyrics
              </button>
            </div>
          )}
        </div>
      ) : (
        // MANUAL MODE
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Song Title
              </label>
              <input
                type="text"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="My Awesome Song"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Target Style
              </label>
              <select
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={manualGenre}
                onChange={(e) => setManualGenre(e.target.value)}
              >
                 {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-slate-300">
                Lyrics
              </label>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
              >
                <Upload className="w-3 h-3" /> Upload .txt file
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".txt"
                onChange={handleFileUpload}
              />
            </div>
            <textarea
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 text-white font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none h-64 resize-y"
              placeholder="Paste your lyrics here or upload a file..."
              value={manualLyrics}
              onChange={(e) => setManualLyrics(e.target.value)}
            />
          </div>

          <button
            onClick={handleManualSubmit}
            disabled={!manualTitle || !manualLyrics}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <Music2 className="w-5 h-5" />
            Compose Song
          </button>
        </div>
      )}
    </div>
  );
};