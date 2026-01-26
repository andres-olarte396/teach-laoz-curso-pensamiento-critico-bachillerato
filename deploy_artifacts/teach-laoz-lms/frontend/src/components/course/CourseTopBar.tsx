import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Volume2, Printer } from 'lucide-react';
import type { MenuItem } from '../../services/apiService';

interface CourseTopBarProps {
  navContext: {
    prev: MenuItem | null;
    next: MenuItem | null;
  } | null;
  isReading: boolean;
  onToggleRead: () => void;
  onPrint: () => void;
}

export const CourseTopBar: React.FC<CourseTopBarProps> = ({ 
  navContext, 
  isReading, 
  onToggleRead, 
  onPrint 
}) => {
  return (
    <div className="flex items-center justify-between gap-4 mb-8">
      {/* Prev */}
      <div className="flex-1">
        {navContext?.prev && (
          <Link
            to={
              navContext.prev.type === "evaluation"
                ? `/evaluation/${navContext.prev.path}`
                : `/course/${navContext.prev.path}`
            }
            className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--color-primary)] text-[10px] font-black uppercase tracking-[0.15em] transition-colors"
          >
            <ChevronLeft size={14} /> {navContext.prev.title}
          </Link>
        )}
      </div>

      {/* Read/Print */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleRead}
          className={`p-3 rounded-full border transition-all ${
            isReading
              ? "text-emerald-500 border-emerald-500 bg-emerald-500/10"
              : "text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          }`}
          title={isReading ? "Pausar Lectura" : "Leer en Voz Alta"}
        >
          {isReading ? (
            <div className="animate-pulse w-4 h-4 rounded-full bg-current" />
          ) : (
            <Volume2 size={16} />
          )}
        </button>
        <button
          onClick={onPrint}
          className="p-3 rounded-full border border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all"
          title="Imprimir Lección"
        >
          <Printer size={16} />
        </button>
      </div>

      {/* Next */}
      <div className="flex-1 text-right">
        {navContext?.next && (
          <Link
            to={
              navContext.next.type === "evaluation"
                ? `/evaluation/${navContext.next.path}`
                : `/course/${navContext.next.path}`
            }
            className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--color-primary)] text-[10px] font-black uppercase tracking-[0.15em] transition-colors"
          >
            {navContext.next.title} <ChevronRight size={14} />
          </Link>
        )}
      </div>
    </div>
  );
};
