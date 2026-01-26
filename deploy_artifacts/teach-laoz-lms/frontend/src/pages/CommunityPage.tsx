import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageCircle, HelpCircle, Code, Coffee, Sparkles } from 'lucide-react';
import { CommentSection } from '../components/CommentSection';

// Categories configuration
const CATEGORIES = [
  { id: 'community_general', label: 'General', icon: MessageCircle, desc: 'Charlas sobre tecnología y educación' },
  { id: 'community_help', label: 'Ayuda', icon: HelpCircle, desc: '¿Atascado? Pide ayuda a la comunidad' },
  { id: 'community_projects', label: 'Proyectos', icon: Code, desc: 'Comparte lo que estás construyendo' },
  { id: 'community_offtopic', label: 'Off-Topic', icon: Coffee, desc: 'Para relajarse un poco' },
];

export const CommunityPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div 
           initial={{ scale: 0.9, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-4"
        >
            <Users size={32} className="text-indigo-400" />
        </motion.div>
        <h1 className="text-4xl font-black text-white tracking-tight mb-2">Comunidad Teach LAOZ</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Conecta con otros estudiantes, resuelve dudas y comparte tus logros. Este es tu espacio.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 flex-shrink-0 grid grid-cols-2 lg:flex lg:flex-col gap-2">
            {CATEGORIES.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`text-left p-4 rounded-xl transition-all border ${
                        activeCategory === cat.id 
                        ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-400' 
                        : 'bg-[var(--bg-surface)] border-transparent hover:border-[var(--border-color)] text-[var(--text-muted)]'
                    }`}
                >
                    <div className="flex items-center gap-3 mb-1">
                        <cat.icon size={18} />
                        <span className="font-bold text-sm tracking-wide">{cat.label}</span>
                    </div>
                    <p className="text-[10px] opacity-70 leading-tight">{cat.desc}</p>
                </button>
            ))}

            {/* Premium/Pro Badge (Visual only) */}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 lg:block hidden">
                <div className="flex items-center gap-2 text-amber-500 mb-2">
                    <Sparkles size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">Tip Pro</span>
                </div>
                <p className="text-[10px] text-amber-200/70">
                    Sé amable y respetuoso. Las mejores oportunidades nacen de una buena conversación.
                </p>
            </div>
        </div>

        {/* Main Discussion Area */}
        <div className="flex-1 w-full min-w-0">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeCategory}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-color)] overflow-hidden shadow-2xl"
                >
                    <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
                         <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            {React.createElement(CATEGORIES.find(c => c.id === activeCategory)?.icon || MessageCircle, { size: 24, className: "text-indigo-400" })}
                            {CATEGORIES.find(c => c.id === activeCategory)?.label}
                         </h2>
                    </div>
                    
                    <div className="p-0">
                        {/* Reuse CommentSection with a virtual resource ID */}
                        <CommentSection 
                            resourceId={activeCategory} 
                            compact={false}
                        />
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
