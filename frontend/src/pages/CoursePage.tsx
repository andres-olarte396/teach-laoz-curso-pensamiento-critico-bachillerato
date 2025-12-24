import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/apiService';
import type { ContentResponse, MenuItem } from '../services/apiService';
import { Loader2, AlertCircle, Calendar, HardDrive, ChevronLeft, ChevronRight, Printer, Home, Music, FileText, CheckSquare, Brain, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContentRenderer } from '../components/ContentRenderer';

export const CoursePage: React.FC = () => {
  const { '*' : path } = useParams();
  const [content, setContent] = useState<ContentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [navContext, setNavContext] = useState<{ prev: MenuItem | null, next: MenuItem | null } | null>(null);
  const [showAudio, setShowAudio] = useState(false);
  const [showScript, setShowScript] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      if (!path) return;
      setLoading(true);
      setError(null);
      try {
        const data = await apiService.getContent(path);
        setContent(data);
        
        // Fetch menu to calculate navigation context
        const menuData = await apiService.getMenu();
        const courseId = path.split('/')[0];
        const course = menuData.courses.find(c => c.id === courseId);
        
        if (course) {
          const flatItems: MenuItem[] = [];
          const flatten = (items: MenuItem[]) => {
            items.forEach(item => {
              if (item.type === 'markdown') {
                flatItems.push(item);
              }
              if (item.children) {
                flatten(item.children);
              }
            });
          };
          flatten([course]);
          
          const currentIndex = flatItems.findIndex(item => item.path === path);
          setNavContext({
            prev: currentIndex > 0 ? flatItems[currentIndex - 1] : null,
            next: currentIndex < flatItems.length - 1 ? flatItems[currentIndex + 1] : null
          });
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al cargar el contenido');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [path]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse">Consultando el repositorio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto mt-20 p-8 rounded-3xl bg-red-400/5 border border-red-400/20 text-center"
      >
        <div className="w-16 h-16 bg-red-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="text-red-400" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Ops! Algo salió mal</h2>
        <p className="text-slate-400 mb-6">{error}</p>
      </motion.div>
    );
  }

  if (!content) return null;

  const breadcrumbs = path?.split('/').filter(Boolean) || [];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={path}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-4xl mx-auto pb-20"
      >
        {/* Breadcrumbs & Utilities */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 print:hidden">
          <nav className="flex flex-wrap items-center gap-2 text-[var(--text-muted)] text-xs font-medium uppercase tracking-widest">
            <Link to="/" className="hover:text-[var(--color-primary)] transition-colors">
              <Home size={14} />
            </Link>
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                <ChevronRightIcon size={12} className="text-[var(--text-muted)] flex-shrink-0" />
                <span className={i === breadcrumbs.length - 1 ? "text-[var(--color-primary)]" : "hover:text-[var(--text-main)] transition-colors cursor-default"}>
                  {crumb.replace(/^teach-laoz-curso-?/i, '').replace(/-/g, ' ').replace('.md', '')}
                </span>
              </React.Fragment>
            ))}
          </nav>
          
          <button 
            onClick={() => window.print()}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--color-primary)] transition-all text-xs font-bold uppercase tracking-wider"
          >
            <Printer size={14} />
            Imprimir
          </button>

          {/* Related Assets Buttons */}
          <div className="flex flex-wrap gap-2">
            {content.relatedAssets?.find(a => a.type === 'audio') && (
              <button 
                onClick={() => setShowAudio(!showAudio)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-xs font-bold uppercase tracking-wider ${showAudio ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-[var(--bg-app)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-emerald-500 hover:border-emerald-500'}`}
              >
                <Music size={14} />
                Escuchar
              </button>
            )}

            {content.relatedAssets?.find(a => a.type === 'script') && (
              <button 
                onClick={() => setShowScript(!showScript)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-xs font-bold uppercase tracking-wider ${showScript ? 'bg-blue-500/10 border-blue-500 text-blue-500' : 'bg-[var(--bg-app)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-blue-500 hover:border-blue-500'}`}
              >
                <FileText size={14} />
                Ver Guión
              </button>
            )}

            {content.relatedAssets?.find(a => a.type === 'exercise') && (
              <Link 
                to={`/course/${content.relatedAssets.find(a => a.type === 'exercise')?.path}`}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-orange-500 hover:border-orange-500 transition-all text-xs font-bold uppercase tracking-wider"
              >
                <CheckSquare size={14} />
                Ejercicios
              </Link>
            )}

            {content.relatedAssets?.find(a => a.type === 'evaluation') && (
              <Link 
                to={`/course/${content.relatedAssets.find(a => a.type === 'evaluation')?.path}`}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-purple-500 hover:border-purple-500 transition-all text-xs font-bold uppercase tracking-wider"
              >
                <Brain size={14} />
                Presentar Test
              </Link>
            )}
          </div>
        </div>

        {/* Content Section */}
        <ContentRenderer 
          html={content.html} 
          path={path}
          metadata={{
            mimeType: content.metadata.mimeType || 'application/octet-stream',
            size: content.metadata.size,
            lastModified: content.metadata.lastModified,
            name: content.name,
            poster: content.frontmatter?.poster,
            relatedAssets: content.relatedAssets,
            showAudio,
            showScript
          }}
          onCloseAudio={() => setShowAudio(false)}
          onCloseScript={() => setShowScript(false)}
        />

        {/* Sequential Navigation */}
        <div className="mt-16 grid grid-cols-2 gap-6 print:hidden">
          {navContext?.prev ? (
            <Link 
              to={`/course/${navContext.prev.path}`}
              className="flex flex-col gap-2 p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--color-primary)] hover:bg-[var(--bg-app)] transition-all group shadow-sm"
            >
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                <ChevronLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
                Anterior
              </span>
              <span className="text-lg font-bold text-[var(--text-main)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
                {navContext.prev.title}
              </span>
            </Link>
          ) : <div />}

          {navContext?.next ? (
            <Link 
              to={`/course/${navContext.next.path}`}
              className="flex flex-col gap-2 p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--color-primary)] hover:bg-[var(--bg-app)] transition-all group text-right items-end shadow-sm"
            >
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                Siguiente
                <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="text-lg font-bold text-[var(--text-main)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
                {navContext.next.title}
              </span>
            </Link>
          ) : <div />}
        </div>

        {/* Footer Metadata Section */}
        <footer className="mt-20 pt-10 border-t border-slate-800/50 print:hidden">
          <div className="flex flex-wrap items-center justify-between gap-6 text-slate-500 text-xs font-medium uppercase tracking-[0.1em]">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-600" />
                <span>Actualizado: {content.metadata.lastModified ? new Date(content.metadata.lastModified).toLocaleDateString() : 'Pendiente'}</span>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive size={14} className="text-slate-600" />
                <span>Tamaño: {(content.metadata.size / 1024).toFixed(1)} KB</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-primary text-[10px] font-bold">
                {content.type}
              </span>
              {content.extension && (
                <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-bold">
                  {content.extension}
                </span>
              )}
            </div>
          </div>
          
          <p className="mt-8 text-slate-600 text-[10px] italic">
            ID del Recurso: {content.name}
          </p>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
};
