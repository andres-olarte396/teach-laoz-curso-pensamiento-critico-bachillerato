import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { Award, Download, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CertificatePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const certificateRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseInfo, setCourseInfo] = useState<any>(null);
  const [completion, setCompletion] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!courseId || !user) return;
      
      try {
        const [comp, menuData] = await Promise.all([
          apiService.getCourseCompletion(courseId),
          apiService.getMenu()
        ]);
        
        const course = menuData.courses.find(c => c.id === courseId);
        
        if (!course) {
          setError('Curso no encontrado');
          setLoading(false);
          return;
        }

        if (comp.percentage < 100) {
          setError('Debes completar el 100% del curso para obtener el certificado');
          setCompletion(comp);
          setLoading(false);
          return;
        }

        setCourseInfo(course);
        setCompletion(comp);
        setLoading(false);
      } catch (err) {
        console.error('Error loading certificate data:', err);
        setError('Error al cargar la información del certificado');
        setLoading(false);
      }
    };

    loadData();
  }, [courseId, user]);

  const downloadPDF = async () => {
    if (!certificateRef.current) return;
    
    setDownloading(true);
    try {
      const element = certificateRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: null
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Certificado_${courseInfo.title.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-[var(--text-muted)] animate-pulse">Generando tu certificado...</p>
      </div>
    );
  }

  if (error && (!completion || completion.percentage < 100)) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-8 bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-color)] shadow-xl text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Award className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-black text-[var(--text-main)] mb-4">{error}</h1>
        {completion && (
          <div className="mb-8 p-4 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-color)]">
            <p className="text-[var(--text-muted)] text-sm mb-2">Progreso actual</p>
            <div className="text-4xl font-black text-primary">{completion.percentage}%</div>
            <p className="text-xs text-[var(--text-muted)] mt-1">({completion.completed} de {completion.total} lecciones)</p>
          </div>
        )}
        <button 
          onClick={() => navigate(`/course/${courseId}`)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:scale-105 transition-transform"
        >
          <ArrowLeft size={18} />
          Volver al Curso
        </button>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate(`/course/${courseId}`)}
          className="flex items-center gap-2 text-[var(--text-muted)] hover:text-primary transition-colors font-bold uppercase text-xs tracking-widest"
        >
          <ArrowLeft size={16} />
          Volver al Curso
        </button>
        
        <button 
          onClick={downloadPDF}
          disabled={downloading}
          className="flex items-center gap-3 px-6 py-3 bg-emerald-500 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          {downloading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          Descargar PDF
        </button>
      </div>

      {/* Certificate Preview Container */}
      <div className="overflow-x-auto pb-8">
        <div 
          ref={certificateRef}
          className="relative min-w-[1000px] aspect-[1.414/1] bg-white text-slate-900 shadow-2xl overflow-hidden font-serif"
          style={{ width: '1000px' }}
        >
          {/* Ornate Border */}
          <div className="absolute inset-0 border-[30px] border-slate-900 m-4 pointer-events-none" />
          <div className="absolute inset-0 border-[1px] border-slate-400 m-12 pointer-events-none" />

          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-center p-24 text-center">
            <div className="w-24 h-24 mb-6">
               <div className="w-full h-full bg-emerald-500 rounded-2xl flex items-center justify-center border-4 border-slate-900 shadow-xl">
                 <span className="text-white font-black italic text-5xl">L</span>
               </div>
            </div>

            <h1 className="text-6xl font-black uppercase tracking-[0.2em] mb-2 text-slate-900">Certificado</h1>
            <h2 className="text-xl font-bold uppercase tracking-[0.5em] mb-12 text-slate-500">De Finalización</h2>

            <p className="text-xl italic mb-4 font-sans text-slate-600">Este documento certifica con orgullo que</p>
            <p className="text-5xl font-black text-slate-900 mb-8 underline decoration-emerald-500 decoration-4 underline-offset-8">
              {user?.name || 'Estudiante Ejemplar'}
            </p>

            <p className="text-xl mb-4 font-sans text-slate-600 max-w-2xl">
              Ha completado satisfactoriamente el programa académico de:
            </p>
            <p className="text-3xl font-black text-slate-800 mb-12 uppercase tracking-wide">
              {courseInfo?.title}
            </p>

            <div className="grid grid-cols-2 gap-24 w-full max-w-3xl mt-12 pt-12 border-t border-slate-200">
               <div>
                 <div className="h-1 bg-slate-400 mb-2" />
                 <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Fecha de Emisión</p>
                 <p className="text-lg font-bold text-slate-800">{today}</p>
               </div>
               <div>
                 <div className="h-1 bg-slate-400 mb-2" />
                 <p className="text-sm font-bold uppercase tracking-widest text-slate-500">ID de Verificación</p>
                 <p className="text-lg font-mono font-bold text-slate-800 uppercase">
                   {courseId?.slice(0,4).toUpperCase()}-{user?.id?.slice(0,6).toUpperCase()}-{(Math.random() * 10000).toFixed(0)}
                 </p>
               </div>
            </div>

            {/* Seals and Badges */}
            <div className="absolute bottom-16 right-16 opacity-20">
              <Award size={120} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
        <CheckCircle2 className="text-emerald-500" size={24} />
        <p className="text-emerald-700 text-sm font-medium">
          <strong>¡Felicidades!</strong> Has demostrado compromiso y disciplina al terminar este curso. Este certificado es el reconocimiento oficial a tu esfuerzo.
        </p>
      </div>
    </div>
  );
};

export default CertificatePage;
