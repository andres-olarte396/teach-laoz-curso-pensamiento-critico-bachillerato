import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import type { MenuItem } from '../services/apiService';
import { Loader2, AlertCircle, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { QuizComponent } from '../components/QuizComponent';

export const EvaluationPage: React.FC = () => {
  const { '*' : path } = useParams();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [navContext, setNavContext] = useState<{ prev: MenuItem | null, next: MenuItem | null } | null>(null);

  useEffect(() => {
    const fetchEvaluation = async () => {
      if (!path) return;
      try {
        setLoading(true);
        const data = await apiService.getEvaluation(path);
        setEvaluation(data);

        // Fetch menu to calculate navigation context (next lesson)
        const courseId = path.split('/')[0];
        const menuData = await apiService.getMenu();
        const course = menuData.courses.find(c => c.id === courseId);
        
        if (course) {
          const flatItems: MenuItem[] = [];
          const flatten = (items: MenuItem[]) => {
            items.forEach(item => {
              if (item.type === 'markdown' || item.type === 'evaluation') {
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
        setError(err.response?.data?.message || 'Error al cargar la evaluación');
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluation();
  }, [path]);

  const handleQuizComplete = (score: number) => {
    // Telemetry: Track evaluation submission
    const courseId = path?.split('/')[0] || 'unknown';
    apiService.trackEvent({
        userId: 'anonymous_user',
        organizationId: 'default_org',
        courseId: courseId,
        lessonId: path,
        type: 'evaluation_submitted',
        metadata: {
            score: score,
            totalQuestions: evaluation.questions.length,
            percentage: (score / evaluation.questions.length) * 100
        }
    }).catch(err => console.error('Failed to track evaluation result:', err));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse">Preparando cuestionario técnico...</p>
      </div>
    );
  }

  if (error || !evaluation) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-8 rounded-3xl bg-red-400/5 border border-red-400/20 text-center">
        <AlertCircle className="text-red-400 mx-auto mb-4" size={48} />
        <h2 className="text-2xl font-bold text-[var(--text-main)] mb-2">Error</h2>
        <p className="text-slate-400 mb-6">{error}</p>
        <button onClick={() => navigate(-1)} className="text-primary font-bold uppercase tracking-widest text-xs">Volver al curso</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors text-xs font-bold uppercase tracking-widest"
            >
                <ChevronLeft size={16} /> Salir
            </button>
            <div className="text-right">
                <h1 className="text-sm font-black text-[var(--text-main)] uppercase tracking-[0.3em] mb-1">{evaluation.title}</h1>
                <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Evaluación de Conocimientos</p>
            </div>
        </div>

        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <QuizComponent 
                title={evaluation.title} 
                questions={evaluation.questions} 
                onComplete={handleQuizComplete}
                nextLesson={navContext?.next}
            />
        </motion.div>
      </div>
    </div>
  );
};
