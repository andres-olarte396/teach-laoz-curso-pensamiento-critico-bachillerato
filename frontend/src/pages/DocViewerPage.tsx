import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, BookOpen, Share2, Printer } from 'lucide-react';

// Reusing existing content renderer principles
export const DocViewerPage: React.FC = () => {
  const { category, docId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

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
  }, [category, docId]);

  return (
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
            <button className="p-2 rounded-lg hover:bg-[var(--bg-app)] text-[var(--text-muted)] transition-colors">
              <Printer size={18} />
            </button>
            <button className="p-2 rounded-lg hover:bg-[var(--bg-app)] text-[var(--text-muted)] transition-colors">
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[var(--text-muted)] font-medium">Cargando manual...</p>
          </div>
        ) : (
          <div 
            className="prose prose-slate dark:prose-invert max-w-none 
              prose-headings:font-black prose-headings:tracking-tight
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-[var(--text-main)]
              prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:bg-primary/5 prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:rounded-r-xl
            "
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </motion.div>
    </div>
  );
};
