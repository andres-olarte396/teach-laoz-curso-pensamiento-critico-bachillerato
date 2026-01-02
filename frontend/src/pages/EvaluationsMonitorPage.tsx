import React, { useEffect, useState } from 'react';
import { apiService } from '../services/apiService';
import { RefreshCcw, CheckCircle2, Circle, AlertTriangle, Clock } from 'lucide-react';

export const EvaluationsMonitorPage: React.FC = () => {
    const [evaluations, setEvaluations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchEvaluations = async () => {
        setLoading(true);
        try {
            const data = await apiService.getEvaluations();
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
    }, []);

    const getStatusIcon = (status: string, score: number) => {
        if (score === -1 || status === 'PENDING') return <Clock className="text-yellow-500 animate-pulse" size={20} />;
        if (status === 'FAILED') return <AlertTriangle className="text-red-500" size={20} />;
        return <CheckCircle2 className="text-green-500" size={20} />;
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Monitor de Evaluaciones IA</h1>
                    <p className="text-slate-400">Estado de procesamiento en tiempo real</p>
                </div>
                <button 
                    onClick={fetchEvaluations}
                    className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition"
                >
                    <RefreshCcw className={`text-white ${loading ? 'animate-spin' : ''}`} size={20} />
                </button>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-950 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                            <th className="p-4 font-bold">Estado</th>
                            <th className="p-4 font-bold">ID Envío</th>
                            <th className="p-4 font-bold">Curso / Lección</th>
                            <th className="p-4 font-bold">Fecha</th>
                            <th className="p-4 font-bold">Puntaje</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {evaluations.map((evalItem) => {
                             const status = evalItem.score === -1 ? 'PENDING' : 'COMPLETED';
                             // Parse ID for display
                             const displayId = evalItem.id.split('/').pop()?.substring(0, 20) + '...';

                             return (
                                <tr key={evalItem.id} className="hover:bg-slate-800/50 transition">
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(status, evalItem.score)}
                                            <span className={`text-xs font-bold ${status === 'PENDING' ? 'text-yellow-500' : 'text-green-500'}`}>
                                                {status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm font-mono text-slate-400" title={evalItem.id}>
                                        {displayId}
                                    </td>
                                    <td className="p-4 text-sm text-slate-300">
                                        {evalItem.courseId} <br/>
                                        <span className="text-xs text-slate-500">{evalItem.lessonId}</span>
                                    </td>
                                    <td className="p-4 text-sm text-slate-400">
                                        {new Date(evalItem.submittedAt).toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        {evalItem.score === -1 ? (
                                            <span className="text-slate-600">-</span>
                                        ) : (
                                            <span className="font-bold text-white">{evalItem.score}/100</span>
                                        )}
                                    </td>
                                </tr>
                             );
                        })}
                        {evaluations.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500">
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
