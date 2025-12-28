import React from 'react';
import { motion } from 'framer-motion';
import { Book, Rocket, HelpCircle, Code, Shield, MessageSquare, Newspaper } from 'lucide-react';

export const DocumentationPage: React.FC = () => {
  const categories = [
    {
      title: 'Primeros Pasos',
      icon: <Rocket className="text-emerald-500" />,
      desc: 'Configura tu cuenta y empieza a aprender en minutos.',
      links: [
        { name: 'Crear una cuenta', id: 'crear-cuenta', cat: 'primeros-pasos' },
        { name: 'Navegación básica', id: 'navegacion-basica', cat: 'primeros-pasos' },
        { name: 'Tu primer curso', id: 'tu-primer-curso', cat: 'primeros-pasos' }
      ]
    },
    {
      title: 'Uso de la Plataforma',
      icon: <Book className="text-blue-500" />,
      desc: 'Domina todas las herramientas de aprendizaje interactivo.',
      links: [
        { name: 'Controles de video/audio', id: 'controles-multimedia', cat: 'uso-plataforma' },
        { name: 'Realizar ejercicios', id: 'realizar-ejercicios', cat: 'uso-plataforma' },
        { name: 'Sistema de notas', id: 'sistema-notas', cat: 'uso-plataforma' }
      ]
    },
    {
      title: 'Preguntas Frecuentes',
      icon: <HelpCircle className="text-amber-500" />,
      desc: 'Respuestas rápidas a las dudas más comunes.',
      links: [
        { name: 'Pagos y suscripciones', id: 'pagos-suscripciones', cat: 'faq' },
        { name: 'Certificaciones', id: 'certificaciones', cat: 'faq' },
        { name: 'Acceso offline', id: 'acceso-offline', cat: 'faq' }
      ]
    },
    {
      title: 'Guías Avanzadas',
      icon: <Code className="text-purple-500" />,
      desc: 'Para aquellos que quieren profundizar en la tecnología.',
      links: [
        { name: 'API para desarrolladores', id: 'api-desarrolladores', cat: 'guias-avanzadas' },
        { name: 'Integraciones', id: 'integraciones', cat: 'guias-avanzadas' },
        { name: 'Contribuir al contenido', id: 'contribuir', cat: 'guias-avanzadas' }
      ]
    },
    {
      title: 'Privacidad y Seguridad',
      icon: <Shield className="text-rose-500" />,
      desc: 'Cómo protegemos tus datos y tu privacidad.',
      links: [
        { name: 'Política de datos', id: 'politica-datos', cat: 'privacidad' },
        { name: 'Seguridad de cuenta', id: 'seguridad-cuenta', cat: 'privacidad' },
        { name: 'GDPR', id: 'gdpr', cat: 'privacidad' }
      ]
    },
    {
      title: 'Comunidad',
      icon: <MessageSquare className="text-cyan-500" />,
      desc: 'Conéctate con otros estudiantes y profesores.',
      links: [
        { name: 'Foros de discusión', id: 'foros', cat: 'comunidad' },
        { name: 'Grupos de estudio', id: 'grupos-estudio', cat: 'comunidad' },
        { name: 'Eventos en vivo', id: 'eventos-vivo', cat: 'comunidad' }
      ]
    },
    {
      title: 'Administración de Cursos',
      icon: <Book className="text-primary" />,
      desc: 'Guías para profesores y administradores sobre gestión de contenido.',
      links: [
        { name: 'Carga de Cursos', id: 'carga-de-cursos', cat: 'administracion' },
        { name: 'Categorización', id: 'categorizacion', cat: 'administracion' },
        { name: 'Actualización de Cursos', id: 'actualizacion-de-cursos', cat: 'administracion' }
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4">
          < Newspaper size={14} />
          <span>Knowledge Base</span>
        </div>
        <h1 className="text-5xl font-black text-[var(--text-main)] mb-6 tracking-tight">Centro de Documentación</h1>
        <p className="text-[var(--text-muted)] text-xl max-w-2xl mx-auto leading-relaxed">
          Todo lo que necesitas saber para aprovechar al máximo tu experiencia en Teach LAOZ.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat, idx) => (
          <motion.div
            key={cat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-primary/50 transition-all group shadow-sm hover:shadow-xl"
          >
            <div className="w-14 h-14 rounded-2xl bg-[var(--bg-app)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-[var(--border-color)] shadow-inner">
              {cat.icon}
            </div>
            <h3 className="text-xl font-bold text-[var(--text-main)] mb-3">{cat.title}</h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6">{cat.desc}</p>
            
            <ul className="space-y-3">
              {cat.links.map(link => (
                <li key={link.id}>
                  <a href={`/documentation/${link.cat}/${link.id}`} className="text-sm text-primary hover:underline flex items-center gap-2 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-20 p-10 rounded-[3rem] bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 text-center"
      >
        <h3 className="text-2xl font-bold text-[var(--text-main)] mb-4">¿No encuentras lo que buscas?</h3>
        <p className="text-[var(--text-muted)] mb-8">Nuestro equipo de soporte está disponible las 24 horas para ayudarte.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="/support" className="px-8 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">
            Ir a Soporte
          </a>
          <a href="/contact" className="px-8 py-3 bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-main)] rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            Contactar ahora
          </a>
        </div>
      </motion.div>
    </div>
  );
};
