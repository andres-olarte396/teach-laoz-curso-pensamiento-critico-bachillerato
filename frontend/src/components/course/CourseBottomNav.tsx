import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronRight as ChevronRightIcon } from 'lucide-react';
import type { MenuItem } from '../../services/apiService';

interface CourseBottomNavProps {
  navContext: {
    prev: MenuItem | null;
    next: MenuItem | null;
  } | null;
}

export const CourseBottomNav: React.FC<CourseBottomNavProps> = ({ navContext }) => {
  return (
    <div className="flex items-center justify-between gap-4 mt-16 mb-8 pt-8 border-t border-[var(--border-color)] print:hidden">
      {/* Prev */}
      <div className="flex-1">
        {navContext?.prev && (
          <Link
            to={
              navContext.prev.type === "evaluation"
                ? `/evaluation/${navContext.prev.path}`
                : `/course/${navContext.prev.path}`
            }
            className="flex flex-col gap-1 text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors group text-left"
          >
            <span className="text-[10px] uppercase tracking-widest font-black flex items-center gap-1 group-hover:-translate-x-1 transition-transform">
              <ChevronLeft size={12} /> Anterior
            </span>
            <span className="text-sm font-medium truncate hidden sm:block">
              {navContext.prev.title}
            </span>
          </Link>
        )}
      </div>

      {/* Up */}
      <div className="flex items-center justify-center">
          <button 
            onClick={() => {
                const mainContainer = document.querySelector('main > div.flex-1');
                if (mainContainer) {
                     mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="p-4 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all group" 
            title="Volver Arriba"
          >
             <ChevronRightIcon size={16} className="-rotate-90 group-hover:-translate-y-1 transition-transform" />
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
            className="flex flex-col gap-1 items-end text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors group text-right"
          >
            <span className="text-[10px] uppercase tracking-widest font-black flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Siguiente <ChevronRight size={12} />
            </span>
            <span className="text-sm font-medium truncate hidden sm:block">
              {navContext.next.title}
            </span>
          </Link>
        )}
      </div>
    </div>
  );
};
