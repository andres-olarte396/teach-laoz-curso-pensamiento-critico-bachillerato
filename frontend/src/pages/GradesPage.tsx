
import React, { useEffect, useState } from 'react';
import { apiService } from '../services/apiService';
import { motion } from 'framer-motion';
import { Award, Calendar, CheckCircle, XCircle, TrendingUp, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Grade {
  id: string;
  courseId: string;
  lessonId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  submittedAt: string;
}

export const GradesPage: React.FC = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const data = await apiService.getMyGrades();
        setGrades(data);
      } catch (err) {
        setError('Error al cargar las calificaciones.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, []);

  const averageScore = grades.length > 0
    ? Math.round(grades.reduce((acc, curr) => acc + (curr.score || 0), 0) / grades.length)
    : 0;

  const passedCount = grades.filter(g => g.score >= 70).length;

  const groupedGrades = React.useMemo(() => {
    const uniqueLessons = Array.from(new Set(grades.map(g => g.lessonId)));
    return uniqueLessons.map(lessonId => {
        const attempts = grades.filter(g => g.lessonId === lessonId);
        const avgScore = Math.round(attempts.reduce((acc, curr) => acc + (curr.score || 0), 0) / attempts.length);
        const latestAttempt = attempts.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];
        
        return {
            ...latestAttempt,
            score: avgScore,
            totalAttempts: attempts.length
        };
    });
  }, [grades]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tight">
          Mis Calificaciones
        </h1>
        <p className="text-[var(--text-muted)] text-lg">
          Sigue tu progreso y revisa tus resultados.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-color)] flex items-center gap-4 shadow-sm"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <TrendingUp size={24} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Promedio General</p>
            <p className="text-3xl font-black text-[var(--text-main)]">{averageScore}%</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-color)] flex items-center gap-4 shadow-sm"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <BookOpen size={24} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Evaluaciones</p>
            <p className="text-3xl font-black text-[var(--text-main)]">{grades.length}</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-color)] flex items-center gap-4 shadow-sm"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
            <Award size={24} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Aprobadas</p>
            <p className="text-3xl font-black text-[var(--text-main)]">{passedCount}</p>
          </div>
        </motion.div>
      </div>

      {/* Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-app)]">
                <th className="p-6 text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Evaluación / Curso</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Fecha</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-[var(--text-muted)] text-center">Puntaje</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-[var(--text-muted)] text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {grades.length === 0 ? (
                <tr>
                   <td colSpan={4} className="p-12 text-center text-[var(--text-muted)]">
                      No has completado ninguna evaluación aún.
                   </td>
                </tr>
              ) : (
                groupedGrades.map((grade) => {
                  const isPassed = (grade.score || 0) >= 70;
                  // Try to make title readable from ID if plain path
                  const displayTitle = grade.lessonId.replace(/_/g, ' ').replace(/-/g, ' ').replace('.md', '');
                  
                  return (
                    <tr key={grade.id} className="group hover:bg-[var(--bg-app)]/50 transition-colors">
                      <td className="p-6">
                        <div className="flex flex-col">
                           <span className="font-bold text-[var(--text-main)] capitalize">{displayTitle}</span>
                           <span className="text-xs text-[var(--text-muted)] font-mono">{grade.courseId}</span>
                        </div>
                      </td>
                      <td className="p-6 text-sm text-[var(--text-muted)]">
                         <div className="flex items-center gap-2">
                           <Calendar size={14} />
                           {format(new Date(grade.submittedAt), 'dd MMM yyyy', { locale: es })}
                         </div>
                      </td>
                      <td className="p-6 text-center">
                         <div className="inline-flex flex-col items-center">
                            <span className="text-xl font-black text-[var(--text-main)]">{grade.score}%</span>
                            <span className="text-[10px] text-[var(--text-muted)] uppercase">Promedio {grade.totalAttempts} intentos</span>
                         </div>
                      </td>
                      <td className="p-6 text-center">
                         <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                           isPassed 
                             ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                             : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                         }`}>
                           {isPassed ? <CheckCircle size={12} /> : <XCircle size={12} />}
                           {isPassed ? 'Aprobado' : 'Reprobado'}
                         </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};
