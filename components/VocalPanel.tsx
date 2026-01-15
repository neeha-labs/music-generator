import React, { useState, useRef } from 'react';
import { convertVocals } from '../services/backendService';
import { VocalConversionJob } from '../types';
import { Upload, Mic2, Play, Loader2, ArrowRight } from 'lucide-react';

export const VocalPanel: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [targetVoice, setTargetVoice] = useState('Ariana_Vibe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [job, setJob] = useState<VocalConversionJob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const result = await convertVocals(file, targetVoice);
      setJob(result);
    } catch (error) {
      console.error(error);
      alert("Conversion failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-pink-500/20 rounded-lg">
          <Mic2 className="w-6 h-6 text-pink-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Vocal Style Transfer</h2>
          <p className="text-slate-400 text-sm">RVC (Retrieval-based Voice Conversion)</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Upload Section */}
        <div 
          className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer bg-slate-900/30"
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="audio/*"
          />
          <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-300 font-medium">
            {file ? file.name : "Click to upload vocal reference"}
          </p>
          <p className="text-slate-500 text-sm mt-1">MP3, WAV (Max 10MB)</p>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div>
             <label className="block text-sm font-medium text-slate-300 mb-2">Target Voice Model</label>
             <div className="grid grid-cols-2 gap-3">
               {['Ariana_Vibe', 'Drake_Style', 'Jazz_Singer', 'Robot_FX'].map((voice) => (
                 <button
                   key={voice}
                   onClick={() => setTargetVoice(voice)}
                   className={`p-3 rounded-lg text-sm font-medium border transition-all ${
                     targetVoice === voice 
                       ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                       : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                   }`}
                 >
                   {voice.replace('_', ' ')}
                 </button>
               ))}
             </div>
          </div>

          <button
            onClick={handleConvert}
            disabled={!file || isProcessing}
            className="w-full bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
            {isProcessing ? 'Processing Audio...' : 'Convert Vocals'}
          </button>
        </div>

        {/* Result */}
        {job && job.convertedUrl && (
          <div className="mt-6 bg-slate-900 p-4 rounded-lg border border-slate-700 animate-fade-in">
             <div className="flex items-center justify-between mb-3">
               <span className="text-sm font-medium text-pink-400">Result ({job.targetVoice})</span>
               <span className="text-xs text-slate-500">Done</span>
             </div>
             <audio controls className="w-full h-10 rounded">
               <source src={job.convertedUrl} type="audio/mpeg" />
             </audio>
             <div className="mt-2 text-center">
                <a href={job.convertedUrl} download className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline">Download Converted Audio</a>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};