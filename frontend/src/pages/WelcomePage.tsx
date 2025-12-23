import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Sparkles, BookOpen, GraduationCap } from 'lucide-react';

export const WelcomePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-24 h-24 bg-gradient-to-tr from-primary to-secondary rounded-3xl flex items-center justify-center mb-8 rotate-3 shadow-[0_0_40px_rgba(var(--color-primary),0.4)]"
      >
        <Rocket className="text-white" size={48} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter"
      >
        Bienvenido a <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">Teach LAOZ</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-xl text-slate-400 mb-12 max-w-2xl leading-relaxed"
      >
        Tu centro de aprendizaje técnico de alto rendimiento. Explora nuestros cursos interactivos 
        diseñados para dominar las tecnologías más demandadas.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
        <FeatureCard 
          icon={<BookOpen className="text-primary" />} 
          title="Contenido Rico" 
          desc="Markdown avanzado con soporte para diagramas y ecuaciones."
          delay={0.4}
        />
        <FeatureCard 
          icon={<Sparkles className="text-accent" />} 
          title="Experiencia Fluida" 
          desc="Navegación instantánea y diseño responsive premium."
          delay={0.5}
        />
        <FeatureCard 
          icon={<GraduationCap className="text-secondary" />} 
          title="Focalizado" 
          desc="Ambiente libre de distracciones optimizado para el estudio."
          delay={0.6}
        />
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, desc: string, delay: number }> = ({ icon, title, desc, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors text-left group"
  >
    <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
    <p className="text-sm text-slate-500 leading-snug">{desc}</p>
  </motion.div>
);
