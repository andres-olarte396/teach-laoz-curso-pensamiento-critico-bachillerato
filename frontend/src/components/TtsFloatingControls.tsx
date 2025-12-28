import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Square, RotateCcw, RotateCw, Pause, Play, Settings, Globe, Check, Zap } from 'lucide-react';

interface TtsFloatingControlsProps {
  isReading: boolean;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSeekForward: () => void;
  onSeekBackward: () => void;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoiceURI: string | null;
  onVoiceChange: (voiceURI: string) => void;
  rate: number;
  onRateChange: (rate: number) => void;
}

export const TtsFloatingControls: React.FC<TtsFloatingControlsProps> = ({
  isReading,
  isPaused,
  onPause,
  onResume,
  onStop,
  onSeekForward,
  onSeekBackward,
  availableVoices,
  selectedVoiceURI,
  onVoiceChange,
  rate,
  onRateChange,
}) => {
  const [showSettings, setShowSettings] = useState(false);

  const selectedVoice = availableVoices.find(v => v.voiceURI === selectedVoiceURI);

  return (
    <AnimatePresence>
      {isReading && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4 print:hidden"
        >
          <div className="relative">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl flex items-center justify-between p-2 gap-1 overflow-hidden transition-all">
              <div className="flex items-center gap-3 px-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-500 animate-pulse">
                  <Volume2 size={16} />
                </div>
                <div className="flex flex-col max-w-[100px] sm:max-w-none">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest leading-none truncate">
                    {selectedVoice ? selectedVoice.name.split(' ')[0] : 'IA Voz'}
                  </span>
                  <span className="text-[9px] font-medium text-slate-400 uppercase tracking-tight truncate">
                    {selectedVoice?.lang.split('-')[1] || 'Voz Activa'}
                  </span>
                </div>
              </div>

              <div className="h-8 w-[1px] bg-white/5 mx-1" />

              <div className="flex items-center gap-1">
                <button
                  onClick={onSeekBackward}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  title="Retroceder 10s"
                >
                  <RotateCcw size={16} />
                </button>

                {isPaused ? (
                  <button
                    onClick={onResume}
                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
                    title="Reanudar"
                  >
                    <Play size={18} fill="currentColor" />
                  </button>
                ) : (
                  <button
                    onClick={onPause}
                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all"
                    title="Pausar"
                  >
                    <Pause size={18} fill="currentColor" />
                  </button>
                )}

                <button
                  onClick={onSeekForward}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  title="Adelantar 10s"
                >
                  <RotateCw size={16} />
                </button>

                <div className="h-8 w-[1px] bg-white/5 mx-1" />

                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2 rounded-xl transition-all ${showSettings ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  title="Ajustes de Voz"
                >
                  <Settings size={16} className={showSettings ? 'animate-spin-slow' : ''} />
                </button>

                <button
                  onClick={onStop}
                  className="p-2 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors ml-1"
                  title="Detener"
                >
                  <Square size={16} fill="currentColor" />
                </button>
              </div>
            </div>

            {/* Voice Selection Dropdown */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-2xl p-3 z-[110] max-h-60 overflow-y-auto custom-scrollbar"
                >
                  <div className="flex items-center gap-2 mb-3 px-1 border-b border-white/5 pb-2">
                    <Zap size={12} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Velocidad de Lectura
                    </span>
                  </div>
                  <div className="flex gap-1 mb-4">
                    {[0.5, 1.0, 1.25, 1.5, 2.0].map((s) => (
                      <button
                        key={s}
                        onClick={() => onRateChange(s)}
                        className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all ${
                          rate === s 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' 
                          : 'bg-white/5 border-transparent text-slate-500 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mb-3 px-1 border-b border-white/5 pb-2">
                    <Globe size={12} className="text-primary" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Seleccionar Voz y Acento
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {availableVoices.map((voice) => (
                      <button
                        key={voice.voiceURI}
                        onClick={() => {
                          onVoiceChange(voice.voiceURI);
                        }}
                        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-all group ${
                          selectedVoiceURI === voice.voiceURI 
                          ? 'bg-primary/20 border border-primary/30 text-white' 
                          : 'hover:bg-white/5 text-slate-400 border border-transparent'
                        }`}
                      >
                        <div className="flex flex-col items-start gap-0.5">
                          <span className={`text-[11px] font-bold ${selectedVoiceURI === voice.voiceURI ? 'text-white' : 'group-hover:text-white'}`}>
                            {voice.name.replace(/(Microsoft|Google|Apple|Spanish|Spain|Mexico|Natural)/g, '').trim() || voice.name}
                          </span>
                          <span className="text-[9px] opacity-50 uppercase tracking-widest">{voice.lang}</span>
                        </div>
                        {selectedVoiceURI === voice.voiceURI ? (
                          <Check size={14} className="text-primary" />
                        ) : (
                           <div className="w-4 h-4 rounded-full border border-white/10 group-hover:border-white/30" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
