import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import type { ContentResponse, MenuItem } from '../services/apiService';
import { Loader2, AlertCircle, Calendar, HardDrive, ChevronLeft, ChevronRight, Printer, Home, Music, FileText, CheckSquare, Brain, ChevronRight as ChevronRightIcon, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContentRenderer } from '../components/ContentRenderer';

import { useTts } from '../hooks/useTts';
import { TtsFloatingControls } from '../components/TtsFloatingControls';

export const CoursePage: React.FC = () => {
  const { '*' : path } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState<ContentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [navContext, setNavContext] = useState<{ prev: MenuItem | null, next: MenuItem | null } | null>(null);
  const [showAudio, setShowAudio] = useState(false);
  const [showScript, setShowScript] = useState(false);
  
  const { 
    isReading,
    isPaused, 
    availableVoices,
    selectedVoiceURI,
    startReading, 
    pauseReading, 
    resumeReading, 
    stopReading,
    seekForward,
    seekBackward,
    setVoice,
    rate,
    setRate
  } = useTts({
    contentSelector: '.content-area'
  });

  useEffect(() => {
    return () => stopReading();
  }, [path, stopReading]);

  useEffect(() => {
    // Scroll to top of the main container when the path changes
    const mainContainer = document.querySelector('main > div.flex-1');
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [path]);

  useEffect(() => {
    const fetchContent = async () => {
      if (!path) return;
      setLoading(true);
      setError(null);
      stopReading();
      
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

          // Telemetry: Track lesson view
          apiService.trackEvent({
            userId: 'anonymous_user', // Placeholder for upcoming Auth Phase
            organizationId: 'default_org',
            courseId: courseId,
            lessonId: path,
            type: 'lesson_viewed',
            metadata: {
              title: data.name,
              timestamp: new Date().toISOString()
            }
          }).catch(err => console.error('Failed to track event:', err));
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

  /* Helper to format file size */
  const formatSize = (bytes: number) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      {/* Floating TTS Controls - Outside AnimatePresence to avoid transform bugs */}
      <TtsFloatingControls 
        isReading={isReading}
        isPaused={isPaused}
        onPause={pauseReading}
        onResume={resumeReading}
        onStop={stopReading}
        onSeekForward={seekForward}
        onSeekBackward={seekBackward}
        availableVoices={availableVoices}
        selectedVoiceURI={selectedVoiceURI}
        onVoiceChange={setVoice}
        rate={rate}
        onRateChange={setRate}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={path}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="max-w-4xl mx-auto pb-0"
        >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 print:hidden">
            {/* ... navigation remains ... */}
          <nav className="flex flex-wrap items-center gap-2 text-[var(--text-muted)] text-xs font-medium uppercase tracking-widest">
            <Link to="/" className="hover:text-[var(--color-primary)] transition-colors">
              <Home size={14} />
            </Link>
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                <ChevronRightIcon size={12} className="text-[var(--text-muted)] flex-shrink-0" />
                <span className={i === breadcrumbs.length - 1 ? "text-[var(--color-primary)]" : "hover:text-[var(--text-main)] transition-colors cursor-default"}>
                  {(() => {
                    const cleanRegex = /^((teach|laoz|curso|learning|system|courses?|educacion|[ ._-]+)+)/i;
                    const cleaned = crumb.replace(cleanRegex, '').replace(/\.(md|html|pdf)$/i, '').replace(/[._-]/g, ' ').trim();
                    return cleaned || crumb.replace(/\.(md|html|pdf)$/i, '').replace(/[._-]/g, ' ');
                  })()}
                </span>
              </React.Fragment>
            ))}
          </nav>
          
          <div className="flex items-center justify-between gap-4 w-full">
            {/* Prev Button (Top) */}
            <div className="flex-1 flex justify-start">
              {navContext?.prev && (
                <Link 
                  to={`/course/${navContext.prev.path}`}
                  className="flex items-center gap-3 px-6 py-2.5 rounded-full bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/30 transition-all group text-[10px] font-black uppercase tracking-[0.15em] shadow-sm"
                  title={navContext.prev.title}
                >
                  <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="hidden sm:inline-block truncate max-w-[150px]">
                    {navContext.prev.title}
                  </span>
                </Link>
              )}
            </div>

            {/* Center Actions */}
            <div className="flex items-center gap-2">
              {/* Universal Back Button */}
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all text-[10px] font-black uppercase tracking-[0.15em] shadow-sm whitespace-nowrap"
              >
                <ChevronLeft size={14} /> REGRESAR
              </button>

              {!isReading ? (
                <button 
                  onClick={startReading}
                  className="flex-shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-full border transition-all text-[10px] font-black uppercase tracking-[0.15em] bg-[var(--bg-app)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--color-primary)]/30 shadow-sm"
                >
                  <Volume2 size={14} />
                  LEER CONTENIDO
                </button>
              ) : (
                  <div className="flex items-center gap-2">
                    <div className="px-6 py-2.5 text-[10px] uppercase tracking-[0.15em] font-black text-emerald-500 animate-pulse bg-emerald-500/5 rounded-full border border-emerald-500/20 shadow-sm">
                      ESCUCHANDO...
                    </div>
                  </div>
              )}
  
              <button 
                onClick={() => window.print()}
                className="flex-shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-full bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--color-primary)]/30 transition-all text-[10px] font-black uppercase tracking-[0.15em] shadow-sm"
              >
                <Printer size={14} />
                IMPRIMIR
              </button>
            </div>

            {/* Next Button (Top) */}
            <div className="flex-1 flex justify-end items-center gap-2 sm:gap-4">
              {navContext?.next && (
                <Link 
                  to={`/course/${navContext.next.path}`}
                  className="flex items-center gap-3 px-6 py-2.5 rounded-full bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/30 transition-all group text-[10px] font-black uppercase tracking-[0.15em] shadow-sm"
                  title={navContext.next.title}
                >
                  <span className="hidden sm:inline-block truncate max-w-[150px]">
                    {navContext.next.title}
                  </span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <ContentRenderer 
          html={content.html || ''} 
          path={path}
          metadata={{
            mimeType: content.metadata?.mimeType || 'application/octet-stream',
            size: content.metadata?.size || 0,
            lastModified: content.metadata?.lastModified || new Date().toISOString(),
            name: content.name,
            poster: content.frontmatter?.poster,
            relatedAssets: content.relatedAssets,
            showAudio,
            showScript
          }}
          onCloseAudio={() => setShowAudio(false)}
          onCloseScript={() => setShowScript(false)}
        />

        {/* Action Buttons & Assets (Moved from Top) */}
        <div className="mt-12 flex flex-col gap-6 print:hidden border-t border-slate-800/50 pt-8">
             {/* Related Assets Buttons */}
             {content.relatedAssets && content.relatedAssets.length > 0 && (
              <div className="flex flex-wrap gap-3 justify-center">
                {content.relatedAssets?.find(a => a.type === 'audio') && (
                  <button 
                    onClick={() => setShowAudio(!showAudio)}
                    className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all text-sm font-bold uppercase tracking-wider min-w-[140px] justify-center ${showAudio ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-[var(--bg-app)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-emerald-500 hover:border-emerald-500 hover:bg-emerald-500/5'}`}
                  >
                    <Music size={16} />
                    Escuchar
                  </button>
                )}

                {content.relatedAssets?.find(a => a.type === 'script') && (
                  <button 
                    onClick={() => setShowScript(!showScript)}
                    className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all text-sm font-bold uppercase tracking-wider min-w-[140px] justify-center ${showScript ? 'bg-blue-500/10 border-blue-500 text-blue-500' : 'bg-[var(--bg-app)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-blue-500 hover:border-blue-500 hover:bg-blue-500/5'}`}
                  >
                    <FileText size={16} />
                    Ver Guión
                  </button>
                )}

                {content.relatedAssets?.find(a => a.type === 'exercise') && (
                  <Link 
                    to={`/course/${content.relatedAssets.find(a => a.type === 'exercise')?.path}`}
                    className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-orange-500 hover:border-orange-500 hover:bg-orange-500/5 transition-all text-sm font-bold uppercase tracking-wider min-w-[140px] justify-center"
                  >
                    <CheckSquare size={16} />
                    Ejercicios
                  </Link>
                )}

                {content.relatedAssets?.find(a => a.type === 'evaluation') && (
                  <Link 
                    to={`/evaluation/${content.relatedAssets.find(a => a.type === 'evaluation')?.path}`}
                    className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-purple-500 hover:border-purple-500 hover:bg-purple-500/5 transition-all text-sm font-bold uppercase tracking-wider min-w-[140px] justify-center"
                  >
                    <Brain size={16} />
                    Presentar Test
                  </Link>
                )}
              </div>
            )}

        </div>

        {/* Sequential Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch justify-between gap-4 print:hidden text-sm">
          {navContext?.prev ? (
            <Link 
              to={`/course/${navContext.prev.path}`}
              className="flex-1 min-w-0 flex items-center justify-start gap-3 px-6 py-3 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--color-primary)] hover:bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-all group shadow-sm"
              title={navContext.prev.title}
            >
              <ChevronLeft size={16} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
              <div className="flex flex-col items-start overflow-hidden">
                 <span className="text-[9px] font-extrabold opacity-50 uppercase tracking-widest">Anterior</span>
                 <span className="font-bold uppercase tracking-wide truncate w-full">{navContext.prev.title}</span>
              </div>
            </Link>
          ) : <div className="flex-1" />}

          {/* Back to Top */}
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="shrink-0 flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--color-primary)] hover:bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-all group shadow-sm"
            title="Volver arriba"
          >
            <ChevronLeft size={16} className="rotate-90 group-hover:-translate-y-1 transition-transform" />
            <span className="font-bold uppercase tracking-widest text-[10px]">Subir</span>
          </button>

          {navContext?.next ? (
            <Link 
              to={`/course/${navContext.next.path}`}
              className="flex-1 min-w-0 flex items-center justify-end gap-3 px-6 py-3 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--color-primary)] hover:bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-all group shadow-sm text-right"
              title={navContext.next.title}
            >
              <div className="flex flex-col items-end overflow-hidden">
                 <span className="text-[9px] font-extrabold opacity-50 uppercase tracking-widest">Siguiente</span>
                 <span className="font-bold uppercase tracking-wide truncate w-full">{navContext.next.title}</span>
              </div>
              <ChevronRight size={16} className="shrink-0 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : <div className="flex-1" />}
        </div>

        {/* Footer Metadata Section */}
        <footer className="mt-8 pt-10 border-t border-slate-800/50 print:hidden">
          <div className="flex flex-wrap items-center justify-between gap-6 text-slate-500 text-xs font-medium uppercase tracking-[0.1em]">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-600" />
                <span>Actualizado: {content.metadata?.lastModified ? new Date(content.metadata.lastModified).toLocaleDateString() : 'Pendiente'}</span>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive size={14} className="text-slate-600" />
                <span>Tamaño: {formatSize(content.metadata?.size || 0)}</span>
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
  </>
  );
};
