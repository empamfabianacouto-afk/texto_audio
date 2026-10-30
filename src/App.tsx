/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { Loader2, Download, Play, FileAudio, Pause } from 'lucide-react';

export default function App() {
  const [text, setText] = useState('');
  const [lang, setLang] = useState('English');
  const [voice, setVoice] = useState('Kore');
  const [format, setFormat] = useState('wav');
  const [audio, setAudio] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const generateAudio = async () => {
    setLoading(true);
    setAudio(null);
    setError(null);
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice, lang }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setAudio(data.audio);
      } else {
        setError(data.error || 'Failed to generate audio');
      }
    } catch (error) {
      console.error('Fetch error details:', error);
      setError(`Failed to connect to server: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadAudio = () => {
    if (!audio) return;
    const link = document.createElement('a');
    link.href = `data:audio/${format};base64,${audio}`;
    link.download = `output.${format}`;
    link.click();
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <header className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Texto para Áudio - IA</h1>
          <p className="text-gray-500 mt-2">Converta seu texto para áudio usando a IA</p>
        </header>

        <textarea
          className="w-full h-40 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          placeholder="Enter text to convert..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="grid grid-cols-3 gap-3">
          <select value={lang} onChange={(e) => setLang(e.target.value)} className="p-3 border border-gray-200 rounded-xl bg-white">
            <option>English</option>
            <option>Portuguese</option>
            <option>Spanish</option>
          </select>
          <select value={voice} onChange={(e) => setVoice(e.target.value)} className="p-3 border border-gray-200 rounded-xl bg-white">
            <option>Kore</option>
            <option>Puck</option>
            <option>Charon</option>
            <option>Fenrir</option>
            <option>Zephyr</option>
          </select>
          <select value={format} onChange={(e) => setFormat(e.target.value)} className="p-3 border border-gray-200 rounded-xl bg-white">
            <option value="wav">WAV</option>
            <option value="mp3">MP3</option>
            <option value="ogg">OGG</option>
          </select>
        </div>

        <button 
          onClick={generateAudio} 
          disabled={loading || !text}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Play size={20} />}
          {loading ? 'Generating...' : 'Generate Speech'}
        </button>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        {audio && (
          <div className="bg-gray-100 p-5 rounded-xl space-y-3">
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={togglePlay} 
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition text-sm font-medium">
                {isPlaying ? <Pause size={16} /> : <Play size={16} />} 
                {isPlaying ? 'Pause' : 'Listen'}
              </button>
              <button 
                type="button"
                onClick={downloadAudio} 
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition text-sm font-medium">
                <Download size={16} /> Download
              </button>
            </div>
            <audio 
              ref={audioRef}
              onEnded={() => setIsPlaying(false)}
              className="hidden" 
              src={`data:audio/wav;base64,${audio}`} 
            />
          </div>
        )}
      </div>
    </div>
  );
}

