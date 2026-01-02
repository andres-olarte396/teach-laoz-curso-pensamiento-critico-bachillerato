import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { OpenResponseComponent } from '../components/OpenResponseComponent';

export const SimulacroPage: React.FC = () => {
    const navigate = useNavigate();

    // Simulacro Data
    const question = "Explique detalladamente la diferencia entre gráficos vectoriales (SVG) e imágenes de mapa de bits (Raster), enfocándose en escalabilidad y estructura interna.";
    const context = [
        "Los gráficos vectoriales (SVG) están definidos por ecuaciones matemáticas (puntos, líneas, curvas), lo que les permite escalar a cualquier tamaño sin perder definición.",
        "Las imágenes raster (mapas de bits) están formadas por una rejilla fija de píxeles. Al ampliar, estos píxeles se hacen visibles, perdiendo calidad.",
        "SVG es ideal para logotipos e iconos. Raster es ideal para fotografías complejas."
    ];

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors text-xs font-bold uppercase tracking-widest"
                    >
                        <ChevronLeft size={16} /> Volver al Inicio
                    </button>
                    <div className="text-right">
                        <h1 className="text-sm font-black text-[var(--text-main)] uppercase tracking-[0.3em] mb-1">Simulacro IA</h1>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Prueba de Concepto</p>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-4">Evaluación de Ensayo Técnico</h2>
                        <p className="text-slate-400 text-sm">
                            Esta es una prueba del sistema de evaluación automática. 
                            Responde a la siguiente pregunta técnica utilizando tus propias palabras. 
                            El sistema analizará tu respuesta basándose en precisión, razonamiento y claridad.
                        </p>
                    </div>

                    <OpenResponseComponent 
                        question={question}
                        context={context}
                        submissionId={`simulacro-${Date.now()}`}
                    />
                </div>
            </div>
        </div>
    );
};
