import React from 'react';
import { motion } from 'framer-motion';
import { LifeBuoy, Mail, MessageCircle, Twitter, Github, Linkedin, CheckCircle, AlertTriangle, ExternalLink, HelpCircle } from 'lucide-react';

export const SupportPage: React.FC = () => {
  const contactMethods = [
    {
      name: 'Email Support',
      value: 'soporte@teachlaoz.com',
      icon: <Mail className="text-blue-500" />,
      action: 'mailto:soporte@teachlaoz.com',
      label: 'Enviar email'
    },
    {
      name: 'Comunidad Discord',
      value: 'Únete a nuestra comunidad',
      icon: <MessageCircle className="text-indigo-500" />,
      action: 'https://discord.gg/teachlaoz',
      label: 'Entrar al server'
    },
    {
      name: 'Twitter / X',
      value: '@TeachLaozHelp',
      icon: <Twitter className="text-sky-400" />,
      action: 'https://twitter.com/teachlaoz',
      label: 'Seguir actualizaciones'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-primary shadow-lg shadow-primary/5 border border-primary/20">
          <LifeBuoy size={40} />
        </div>
        <h1 className="text-5xl font-black text-[var(--text-main)] mb-6 tracking-tight">Centro de Soporte</h1>
        <p className="text-[var(--text-muted)] text-xl max-w-2xl mx-auto leading-relaxed">
          Estamos aquí para ayudarte a superar cualquier obstáculo en tu camino de aprendizaje.
        </p>
      </motion.div>

      {/* System Status Sidebar/Widget simulated */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-[var(--text-main)] mb-6 flex items-center gap-2">
              <MessageCircle size={24} className="text-primary" />
              Canales de Comunicación
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contactMethods.map((method) => (
                <a 
                  key={method.name} 
                  href={method.action}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-primary/50 transition-all group flex items-start gap-4 shadow-sm hover:shadow-md"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[var(--bg-app)] flex items-center justify-center border border-[var(--border-color)] group-hover:scale-110 transition-transform shadow-inner">
                    {method.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[var(--text-main)] mb-1">{method.name}</h3>
                    <p className="text-xs text-[var(--text-muted)] mb-3">{method.value}</p>
                    <span className="text-xs text-primary font-bold flex items-center gap-1">
                      {method.label}
                      <ExternalLink size={12} />
                    </span>
                  </div>
                </a>
              ))}
              <a 
                href="/contact"
                className="p-6 rounded-3xl bg-primary text-white hover:opacity-90 transition-all group flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
              >
                <div className="text-center">
                  <h3 className="font-bold mb-1">Formulario de Contacto</h3>
                  <p className="text-xs text-white/80">Soporte directo vía ticket</p>
                </div>
              </a>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text-main)] mb-6 flex items-center gap-2">
              <HelpCircle size={24} className="text-primary" />
              Preguntas Rápidas
            </h2>
            <div className="space-y-4">
              {[
                { q: "¿Cómo recupero mi contraseña?", a: "Puedes restablecerla desde la página de login haciendo clic en '¿Olvidaste tu contraseña?'." },
                { q: "¿Tienen certificados oficiales?", a: "Sí, cada curso completado al 100% genera un certificado digital verificable." },
                { q: "¿Se puede ver el contenido offline?", a: "Actualmente estamos trabajando en una versión descargable de los cursos." }
              ].map((faq, i) => (
                <div key={i} className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
                  <h4 className="font-bold text-[var(--text-main)] mb-2">{faq.q}</h4>
                  <p className="text-sm text-[var(--text-muted)]">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="p-8 rounded-[2.5rem] bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm">
            <h3 className="font-bold text-[var(--text-main)] mb-6 flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-500" />
              Estado del Sistema
            </h3>
            <div className="space-y-4">
              <StatusItem label="Plataforma Web" status="Operativo" color="text-emerald-500" />
              <StatusItem label="Servicios de Video" status="Operativo" color="text-emerald-500" />
              <StatusItem label="API Learner" status="Mantenimiento" color="text-amber-500" icon={<AlertTriangle size={12} />} />
              <StatusItem label="CDN Global" status="Operativo" color="text-emerald-500" />
            </div>
            <div className="mt-8 pt-6 border-t border-[var(--border-color)]">
              <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-widest text-center">
                Última actualización: hace 5 min
              </p>
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-center">
             <h3 className="font-bold text-[var(--text-main)] mb-4">Síguenos</h3>
             <div className="flex justify-center gap-4">
               <SocialIcon icon={<Twitter size={20} />} href="https://twitter.com/teachlaoz" />
               <SocialIcon icon={<Github size={20} />} href="https://github.com/teachlaoz" />
               <SocialIcon icon={<Linkedin size={20} />} href="https://linkedin.com/company/teachlaoz" />
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const StatusItem: React.FC<{ label: string, status: string, color: string, icon?: React.ReactNode }> = ({ label, status, color, icon }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-[var(--text-muted)]">{label}</span>
    <div className={`flex items-center gap-1.5 text-xs font-bold ${color}`}>
      {icon || <div className="w-2 h-2 rounded-full bg-current" />}
      {status}
    </div>
  </div>
);

const SocialIcon: React.FC<{ icon: React.ReactNode, href: string }> = ({ icon, href }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="w-12 h-12 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-primary hover:border-primary/50 transition-all shadow-sm"
  >
    {icon}
  </a>
);
