import React, { useEffect, useState } from 'react';
import { apiService } from '../services/apiService';
import { RefreshCcw, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export const EvaluationsMonitorPage: React.FC = () => {
    const [evaluations, setEvaluations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [userIdFilter, setUserIdFilter] = useState('');
    const [debouncedFilter, setDebouncedFilter] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilter(userIdFilter);
        }, 500);
        return () => clearTimeout(timer);
    }, [userIdFilter]);

    const fetchEvaluations = async () => {
        setLoading(true);
        try {
            const data = await apiService.getEvaluations(debouncedFilter);
            setEvaluations(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvaluations();
        const interval = setInterval(fetchEvaluations, 5000);
        return () => clearInterval(interval);
    }, [debouncedFilter]);

    const getStatusIcon = (status: string, score: number) => {
        if (score === -1 || status === 'PENDING') return <Clock className="text-yellow-500 animate-pulse" size={20} />;
        if (status === 'FAILED') return <AlertTriangle className="text-red-500" size={20} />;
        return <CheckCircle2 className="text-emerald-500" size={20} />;
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-[var(--text-main)] mb-1 tracking-tight">Monitor de Evaluaciones</h1>
                    <p className="text-[var(--text-muted)]">Estado de procesamiento de IA en tiempo real</p>
                </div>
                <div className="flex items-center gap-3">
                    <input 
                        type="text" 
                        placeholder="Filtrar por User ID..." 
                        value={userIdFilter}
                        onChange={(e) => setUserIdFilter(e.target.value)}
                        className="bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-main)] placeholder-[var(--text-muted)] px-4 py-2 rounded-xl text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all shadow-sm w-64"
                    />
                    <button 
                        onClick={() => fetchEvaluations()}
                        className="p-2 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all shadow-sm"
                    >
                        <RefreshCcw className={`${loading ? 'animate-spin' : ''}`} size={20} />
                    </button>
                </div>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-[var(--bg-app)] border-b border-[var(--border-color)] text-xs uppercase tracking-widest text-[var(--text-muted)]">
                            <th className="p-6 font-black">Estado</th>
                            <th className="p-6 font-black">ID Envío</th>
                            <th className="p-6 font-black">Curso / Lección</th>
                            <th className="p-6 font-black">Fecha</th>
                            <th className="p-6 font-black text-right">Puntaje</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                        {evaluations.map((evalItem) => {
                             const status = evalItem.score === -1 ? 'PENDING' : 'COMPLETED';
                             // Parse ID for display
                             const displayId = evalItem.id.split('/').pop()?.substring(0, 8) + '...';

                             return (
                                <tr key={evalItem.id} className="hover:bg-[var(--bg-app)] transition-colors">
                                    <td className="p-6">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(status, evalItem.score)}
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                                                {status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className="font-mono text-xs bg-[var(--bg-app)] px-2 py-1 rounded border border-[var(--border-color)] text-[var(--text-muted)]">
                                            {displayId}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-[var(--text-main)] text-sm">{evalItem.courseId}</span>
                                            <span className="text-xs text-[var(--text-muted)] font-mono mt-0.5">{evalItem.lessonId.split('/').pop()}</span>
                                        </div>
                                    </td>
                                    <td className="p-6 text-sm text-[var(--text-muted)]">
                                        {new Date(evalItem.submittedAt).toLocaleString()}
                                    </td>
                                    <td className="p-6 text-right">
                                        {evalItem.score === -1 ? (
                                            <span className="text-[var(--text-muted)]">-</span>
                                        ) : (
                                            <span className={`text-lg font-black ${evalItem.score >= 70 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {evalItem.score}%
                                            </span>
                                        )}
                                    </td>
                                </tr>
                             );
                        })}
                        {evaluations.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-[var(--text-muted)]">
                                    No hay evaluaciones registradas.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
