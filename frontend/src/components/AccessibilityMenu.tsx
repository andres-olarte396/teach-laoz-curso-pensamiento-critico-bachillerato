import React, { useState, useRef, useEffect } from 'react';
import { Type, ArrowUpDown, Brain, Info, X, RotateCcw, AlertTriangle } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

export const AccessibilityMenu: React.FC = () => {
  const { settings, updateFontSize, updateLineSpacing, toggleDyslexicFont, toggleHighContrast, resetSettings } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-primary hover:bg-primary/5 hover:scale-105 transition-all border border-[var(--border-color)] shadow-sm"
        title="Ajustes de Lectura y Accesibilidad"
      >
        <Type size={20} />
      </button>

      {isOpen && (
        <div ref={menuRef} className="absolute bottom-12 left-0 w-72 z-50 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border-color)]/50">
            <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
              <Type size={16} /> Lectura y Accesibilidad
            </h3>
            <button 
              onClick={() => setIsOpen(false)} 
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-[var(--text-muted)] hover:text-red-500 transition-all"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
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
                  <span className="text-[9px] opacity-70 mt-1">OpenDyslexic Font</span>
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

            <button 
              onClick={resetSettings}
              className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-bold text-[var(--text-muted)] hover:text-primary transition-colors mt-2"
            >
              <RotateCcw size={12} /> Restablecer Ajustes
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border-color)]/50 flex items-start gap-2 text-[9px] text-[var(--text-muted)] italic leading-tight">
            <Info size={12} className="shrink-0 mt-0.5" />
            <span>Estos ajustes se guardan automáticamente en tu dispositivo para futuras sesiones.</span>
          </div>
        </div>
      )}
    </div>
  );
};
