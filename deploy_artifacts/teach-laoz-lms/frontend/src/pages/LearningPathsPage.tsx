import React from 'react';
import { motion } from 'framer-motion';
import { Map } from 'lucide-react';

export const LearningPathsPage: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto pb-20 text-center"
    >
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 text-primary">
        <Map size={40} />
      </div>
      <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Rutas de Aprendizaje</h1>
      <p className="text-slate-400 text-lg">
        Próximamente encontrarás caminos estructurados para dominar nuevas habilidades.
      </p>
    </motion.div>
  );
};
