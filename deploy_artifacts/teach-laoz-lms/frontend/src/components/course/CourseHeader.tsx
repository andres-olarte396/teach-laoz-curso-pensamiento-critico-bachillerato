import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ChevronRight as ChevronRightIcon, CheckCircle, Lock, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

interface CourseHeaderProps {
  path: string | undefined;
  isLessonCompleted: boolean;
  sidebarMode: "none" | "forum" | "evidence";
  setSidebarMode: (mode: "none" | "forum" | "evidence") => void;
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({ 
  path, 
  isLessonCompleted, 
  sidebarMode, 
  setSidebarMode 
}) => {
  const breadcrumbs = path?.split("/").filter(Boolean) || [];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8 print:hidden">
      <nav className="flex flex-wrap items-center gap-2 text-[var(--text-muted)] text-xs font-medium uppercase tracking-widest">
        <Link
          to="/"
          className="hover:text-[var(--color-primary)] transition-colors"
        >
          <Home size={14} />
        </Link>
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            <ChevronRightIcon
              size={12}
              className="text-[var(--text-muted)] flex-shrink-0"
            />
            <span
              className={
                i === breadcrumbs.length - 1
                  ? "text-[var(--color-primary)]"
                  : "hover:text-[var(--text-main)] transition-colors cursor-default"
              }
            >
              {(() => {
                const cleanRegex =
                  /^((teach|laoz|curso|learning|system|courses?|educacion|[ ._-]+)+)/i;
                const cleaned = crumb
                  .replace(cleanRegex, "")
                  .replace(/\.(md|html|pdf)$/i, "")
                  .replace(/[._-]/g, " ")
                  .trim();
                return (
                  cleaned ||
                  crumb
                    .replace(/\.(md|html|pdf)$/i, "")
                    .replace(/[._-]/g, " ")
                );
              })()}
            </span>
          </React.Fragment>
        ))}

        {isLessonCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ml-4 flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-md border border-emerald-500/20"
          >
            <CheckCircle size={12} />
            <span className="text-[10px] font-bold">VISTO</span>
          </motion.div>
        )}
      </nav>

      <div className="flex items-center gap-2">
        <button
          onClick={() =>
            setSidebarMode(
              sidebarMode === "evidence" ? "none" : "evidence"
            )
          }
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
            sidebarMode === "evidence"
              ? "bg-amber-500 text-white border-transparent"
              : "bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-amber-500 hover:border-amber-500"
          }`}
          title="Mi Bitácora Privada"
        >
          <Lock size={14} />
          <span className="hidden sm:inline">Bitácora</span>
        </button>

        <button
          onClick={() =>
            setSidebarMode(sidebarMode === "forum" ? "none" : "forum")
          }
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
            sidebarMode === "forum"
              ? "bg-[var(--color-primary)] text-white border-transparent"
              : "bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--color-primary)]"
          }`}
        >
          <MessageSquare size={14} />
          <span className="hidden sm:inline">Foro</span>
        </button>
      </div>
    </div>
  );
};
