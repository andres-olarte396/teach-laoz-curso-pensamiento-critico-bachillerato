import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, BookOpen, Share2, Printer, Volume2, Check } from 'lucide-react';
import { useTts } from '../hooks/useTts';
import { TtsFloatingControls } from '../components/TtsFloatingControls';

// Reusing existing content renderer principles
export const DocViewerPage: React.FC = () => {
  const { category, docId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

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
    seekBackward
  } = useTts({
    contentSelector: '.content-area'
  });

  useEffect(() => {
    return () => stopReading();
  }, [docId, stopReading]);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        setLoading(true);
        // Ensure we call the correct API endpoint
        // Assuming API is on :3000, we should let the proxy handle it or use a service
        const response = await fetch(`/api/docs/${category}/${docId}`);
        if (response.ok) {
          const data = await response.json();
          setContent(data.html || 'Contenido no disponible');
        } else {
          // Fallback to /api/content/docs/... if DocController route is missing
          const fallbackResponse = await fetch(`/api/content/docs/${category}/${docId}.md`);
          if (fallbackResponse.ok) {
             const data = await fallbackResponse.json();
             setContent(data.html || 'Contenido no disponible');
          } else {
             setContent('# Documento no encontrado\nLo sentimos, el manual solicitado no existe.');
          }
        }
      } catch (error) {
        console.error('Error fetching doc:', error);
        setContent('# Error\nHubo un problema al cargar la documentación.');
      } finally {
        setLoading(false);
      }
    };

    if (category && docId) fetchDoc();
  }, [category, docId, stopReading]);

  const handlePrint = () => {
    window.print();
  };

  const [shared, setShared] = useState(false);
  const handleShare = async () => {
    const shareData = {
      title: `Teach LAOZ - ${docId?.replace(/-/g, ' ')}`,
      text: `Echa un vistazo a esta guía en Teach LAOZ: ${docId?.replace(/-/g, ' ')}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <>
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
      />
    <div className="max-w-4xl mx-auto py-12 px-6">
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/documentation')}
        className="flex items-center gap-2 text-primary font-bold mb-8 hover:underline group"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Volver al Centro de Documentación
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[2.5rem] p-10 shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between mb-8 pb-8 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <BookOpen size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-primary/60">Manual de Soporte</span>
              <p className="text-sm text-[var(--text-muted)] capitalize">{category?.replace('-', ' ')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="p-2 rounded-lg hover:bg-[var(--bg-app)] text-[var(--text-muted)] transition-colors"
              title="Imprimir documento"
            >
              <Printer size={18} />
            </button>
            <button 
              onClick={handleShare}
              className={`p-2 rounded-lg transition-all ${shared ? 'bg-emerald-500/10 text-emerald-500' : 'hover:bg-[var(--bg-app)] text-[var(--text-muted)]'}`}
              title={shared ? "¡Copiado!" : "Compartir documento"}
            >
              {shared ? <Check size={18} /> : <Share2 size={18} />}
            </button>
            <div className="h-8 w-[1px] bg-[var(--border-color)] mx-1" />
            {!isReading ? (
              <button 
                onClick={startReading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all text-xs font-bold uppercase tracking-wider"
              >
                <Volume2 size={16} />
                Leer Manual
              </button>
            ) : (
              <div className="px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-emerald-500 animate-pulse bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                Leyendo...
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[var(--text-muted)] font-medium">Cargando manual...</p>
          </div>
        ) : (
          <div 
            className="content-area max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </motion.div>
    </div>
    </>
  );
};
