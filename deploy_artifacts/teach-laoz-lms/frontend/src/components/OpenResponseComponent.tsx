import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { Loader2, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface OpenResponseComponentProps {
  question: string;
  context?: string[];
  submissionId?: string;
  onComplete?: (result: any) => void;
}

export const OpenResponseComponent: React.FC<OpenResponseComponentProps> = ({ 
  question, 
  context = [],
  submissionId = 'simulated-submission',
  onComplete 
}) => {
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async () => {
    if (answer.trim().length < 10) {
      setError('La respuesta es muy corta. Por favor desarrolla más tu idea.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiService.submitAIEvaluation({
        submissionId,
        question,
        answer,
        context
      });

      if (data.success) {
        if (data.status === 'pending') {
            setIsPending(true);
        } else {
            setResult(data.data);
            if (onComplete) onComplete(data.data);
        }
      } else {
        throw new Error('La evaluación no se pudo completar.');
      }

    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.error || err.message || 'Error de conexión';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-slate-700 rounded-xl p-6"
      >
        <div className="flex flex-col items-center text-center gap-4 py-8">
          <div className="p-4 bg-blue-500/10 rounded-full">
            <Loader2 className="text-blue-400 animate-spin-slow" size={48} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Evaluación en Proceso</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              Hemos recibido tu respuesta correctamente. Nuestros agentes de IA están analizándola en segundo plano.
            </p>
            <p className="text-xs text-slate-500 mt-4 uppercase tracking-widest font-bold">
               Notificación pendiente
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (result) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-slate-700 rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <CheckCircle2 className={result.passed ? "text-green-500" : "text-yellow-500"} size={32} />
          <div>
            <h3 className="text-lg font-bold text-white">Evaluación Completada</h3>
            <p className="text-sm text-slate-400">Puntaje: <span className="font-mono font-bold text-primary">{result.score}/100</span></p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Observación General</h4>
            <p className="text-sm text-slate-300">{result.result.generalObservation}</p>
          </div>

          <div className="grid gap-3">
             {Object.entries(result.result.criterionResults).map(([key, val]: any) => (
               <div key={key} className="border-l-2 border-slate-600 pl-3 py-1">
                 <div className="flex justify-between items-start">
                   <span className="text-xs font-bold text-slate-400">{key}</span>
                   <span className={`text-xs px-2 py-0.5 rounded font-mono ${val.level >= 2 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                     Nivel {val.level}/3
                   </span>
                 </div>
                 <p className="text-xs text-slate-400 mt-1 italic">"{val.evidence}"</p>
                 <p className="text-xs text-slate-300 mt-1">{val.comment}</p>
               </div>
             ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-primary/10 rounded-lg">
           <FileText className="text-primary" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Pregunta Abierta</h3>
          <p className="text-slate-300 mt-2 text-sm leading-relaxed">{question}</p>
        </div>
      </div>

      <div className="mb-4">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Escribe tu respuesta técnica aquí..."
          className="w-full h-40 bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm text-slate-200 focus:ring-2 focus:ring-primary/50 outline-none resize-none placeholder:text-slate-600"
          disabled={loading}
        />
        {error && (
            <div className="flex items-center gap-2 mt-2 text-red-400 text-xs">
                <AlertTriangle size={12} />
                <span>{error}</span>
            </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading || !answer}
          className="flex items-center gap-2 bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : 'Enviar Respuesta'}
        </button>
      </div>
    </div>
  );
};
