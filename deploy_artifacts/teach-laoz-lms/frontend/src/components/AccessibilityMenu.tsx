import React, { useState, useRef, useEffect } from 'react';
import { Type, ArrowUpDown, Brain, Info, X, RotateCcw, AlertTriangle, Volume2, Globe, Zap, Check, Settings, Moon, Sun, Monitor } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useTheme } from '../context/ThemeContext';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

export const AccessibilityMenu: React.FC = () => {
  const { settings, updateFontSize, updateLineSpacing, toggleDyslexicFont, toggleHighContrast, updateTtsVoice, updateTtsRate, resetSettings } = useAccessibility();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load voices for preference selection
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      const esVoices = allVoices.filter(v => v.lang.startsWith('es'));
      setAvailableVoices(esVoices);
      
      // Initialize default if not set
      if (!settings.ttsVoiceURI && esVoices.length > 0) {
        const preferred = esVoices.find(v => v.name.includes('Google') || v.name.includes('Natural')) || esVoices[0];
        if (preferred) updateTtsVoice(preferred.voiceURI);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [settings.ttsVoiceURI, updateTtsVoice]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen && 
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);


  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] rounded-md transition-colors"
        title="Accesibilidad"
      >
        <span className="sr-only">Menú de accesibilidad</span>
        <Settings size={16} />
      </button>

      {isOpen && (
        <div ref={menuRef} className="absolute bottom-12 left-0 w-80 z-[1000] bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border-color)]/50">
            <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
              <Settings size={16} /> Personalización
            </h3>
            <button 
              onClick={() => setIsOpen(false)} 
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-[var(--text-muted)] hover:text-red-500 transition-all"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
            {/* --- TEMA DE INTERFAZ --- */}
            <div className="space-y-4">
              <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block opacity-50 flex items-center gap-2">
                <Monitor size={12} /> Apariencia
              </span>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTheme("light")}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all duration-300",
                    theme === "light"
                      ? "bg-amber-400/10 border-amber-400/40 text-amber-600 shadow-sm"
                      : "bg-[var(--bg-app)] border-[var(--border-color)]/50 text-[var(--text-muted)] hover:border-amber-400/30"
                  )}
                >
                  <Sun size={14} className={theme === "light" ? "fill-current" : ""} />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Claro</span>
                </button>

                <button
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all duration-300",
                    theme === "dark"
                      ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-500 shadow-sm"
                      : "bg-[var(--bg-app)] border-[var(--border-color)]/50 text-[var(--text-muted)] hover:border-indigo-500/30"
                  )}
                >
                  <Moon size={14} className={theme === "dark" ? "fill-current" : ""} />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Oscuro</span>
                </button>

                <button
                  onClick={() => setTheme("system")}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all duration-300",
                    theme === "system"
                      ? "bg-sky-500/10 border-sky-500/40 text-sky-500 shadow-sm"
                      : "bg-[var(--bg-app)] border-[var(--border-color)]/50 text-[var(--text-muted)] hover:border-sky-500/30"
                  )}
                >
                  <Monitor size={14} />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Auto</span>
                </button>
              </div>
            </div>

            {/* --- LECTURA VISUAL --- */}
            <div className="space-y-4">
              <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block opacity-50">Lectura Visual</span>
              
              {/* Font Size */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-2">
                    <Type size={14} /> Tamaño de Letra
                  </span>
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {Math.round(settings.fontSize * 100)}%
                  </span>
                </div>
                <input 
                  type="range"
                  min="0.8"
                  max="1.5"
                  step="0.05"
                  value={settings.fontSize}
                  onChange={(e) => updateFontSize(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[var(--bg-app)] border border-[var(--border-color)]/30 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Line Spacing */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-2">
                    <ArrowUpDown size={14} /> Interlineado
                  </span>
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {settings.lineSpacing.toFixed(1)}
                  </span>
                </div>
                <input 
                  type="range"
                  min="1.2"
                  max="2.5"
                  step="0.1"
                  value={settings.lineSpacing}
                  onChange={(e) => updateLineSpacing(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[var(--bg-app)] border border-[var(--border-color)]/30 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>

            {/* --- VOZ E IA --- */}
            <div className="space-y-4 pt-2 border-t border-[var(--border-color)]/30">
              <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block opacity-50 flex items-center gap-2">
                <Volume2 size={12} /> Voz e IA (TTS)
              </span>
              
              {/* Voice Rate */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-2">
                    <Zap size={14} /> Velocidad de Lectura
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full">
                    {settings.ttsRate.toFixed(2)}x
                  </span>
                </div>
                <input 
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.25"
                  value={settings.ttsRate}
                  onChange={(e) => updateTtsRate(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[var(--bg-app)] border border-[var(--border-color)]/30 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Voice Selection */}
              <div className="space-y-3">
                <span className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-2">
                    <Globe size={14} /> Seleccionar Voz
                </span>
                <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                    {availableVoices.map((voice) => (
                      <button
                        key={voice.voiceURI}
                        onClick={() => updateTtsVoice(voice.voiceURI)}
                        className={cn(
                          "flex items-center justify-between w-full px-3 py-2 rounded-xl transition-all group border text-left",
                          settings.ttsVoiceURI === voice.voiceURI 
                          ? "bg-primary/5 border-primary/30 text-[var(--text-main)]" 
                          : "bg-[var(--bg-app)] border-transparent text-[var(--text-muted)] hover:border-primary/30 hover:bg-primary/5"
                        )}
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] font-bold truncate">
                            {voice.name.replace(/(Microsoft|Google|Apple|Spanish|Spain|Mexico|Natural)/g, '').trim() || voice.name}
                          </span>
                          <span className="text-[9px] opacity-70 uppercase tracking-widest">{voice.lang}</span>
                        </div>
                        {settings.ttsVoiceURI === voice.voiceURI && (
                          <Check size={14} className="text-primary shrink-0" />
                        )}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* --- OPCIONES ADICIONALES --- */}
            <div className="space-y-3 pt-2 border-t border-[var(--border-color)]/30">
              {/* Dyslexic Font */}
              <button 
                onClick={toggleDyslexicFont}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl border transition-all",
                  settings.dyslexicFont 
                    ? "bg-primary/5 border-primary/30 text-primary shadow-sm"
                    : "bg-[var(--bg-app)] border-[var(--border-color)]/50 text-[var(--text-muted)] hover:border-primary/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <Brain size={16} />
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-xs font-bold">Fuente Dislexia</span>
                    <span className="text-[9px] opacity-70 mt-1">OpenDyslexic</span>
                  </div>
                </div>
                <div className={cn(
                  "w-8 h-4 rounded-full relative transition-colors",
                  settings.dyslexicFont ? "bg-primary" : "bg-[var(--text-muted)]/20"
                )}>
                  <div className={cn(
                    "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm",
                    settings.dyslexicFont ? "left-4.5" : "left-0.5"
                  )} />
                </div>
              </button>

              {/* High Contrast */}
              <button 
                onClick={toggleHighContrast}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl border transition-all",
                  settings.highContrast 
                    ? "bg-amber-500/5 border-amber-500/30 text-amber-600 shadow-sm"
                    : "bg-[var(--bg-app)] border-[var(--border-color)]/50 text-[var(--text-muted)] hover:border-amber-500/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle size={16} />
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-xs font-bold">Alto Contraste</span>
                    <span className="text-[9px] opacity-70 mt-1">Colores Puros</span>
                  </div>
                </div>
                <div className={cn(
                  "w-8 h-4 rounded-full relative transition-colors",
                  settings.highContrast ? "bg-amber-500" : "bg-[var(--text-muted)]/20"
                )}>
                  <div className={cn(
                    "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm",
                    settings.highContrast ? "left-4.5" : "left-0.5"
                  )} />
                </div>
              </button>
            </div>

            <button 
              onClick={resetSettings}
              className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-bold text-[var(--text-muted)] hover:text-primary transition-colors mt-2"
            >
              <RotateCcw size={12} /> Restablecer Ajustes
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border-color)]/50 flex items-start gap-2 text-[9px] text-[var(--text-muted)] italic leading-tight">
            <Info size={12} className="shrink-0 mt-0.5" />
            <span>Configuración guardada localmente para tu próxima sesión.</span>
          </div>
        </div>
      )}
    </div>
  );
};
