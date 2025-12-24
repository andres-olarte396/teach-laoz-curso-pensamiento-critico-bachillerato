import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Square, RotateCcw, RotateCw, Pause, Play } from 'lucide-react';

interface TtsFloatingControlsProps {
  isReading: boolean;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSeekForward: () => void;
  onSeekBackward: () => void;
}

export const TtsFloatingControls: React.FC<TtsFloatingControlsProps> = ({
  isReading,
  isPaused,
  onPause,
  onResume,
  onStop,
  onSeekForward,
  onSeekBackward,
}) => {
  return (
    <AnimatePresence>
      {isReading && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 print:hidden"
        >
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl flex items-center justify-between p-2 gap-1 overflow-hidden">
            <div className="flex items-center gap-3 px-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-500 animate-pulse">
                <Volume2 size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest leading-none">Lectura en curso</span>
                <span className="text-[9px] font-medium text-slate-400 uppercase tracking-tight">IA Voz Activa</span>
              </div>
            </div>

            <div className="h-8 w-[1px] bg-white/5 mx-2" />

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

              <button
                onClick={onStop}
                className="p-2 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors ml-1"
                title="Detener"
              >
                <Square size={16} fill="currentColor" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
