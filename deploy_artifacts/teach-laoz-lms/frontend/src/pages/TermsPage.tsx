import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, FileText, Lock, Eye, ScrollText, CheckCircle2 } from 'lucide-react';

export const TermsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('terms');

  const sections = [
    { id: 'terms', title: 'Términos de Servicio', icon: <ScrollText size={18} /> },
    { id: 'privacy', title: 'Política de Privacidad', icon: <Lock size={18} /> },
    { id: 'cookies', title: 'Política de Cookies', icon: <Eye size={18} /> },
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sticky Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                <Shield size={24} />
              </div>
              <h2 className="font-bold text-[var(--text-main)]">Legal</h2>
            </div>
            
            <nav className="space-y-1">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeSection === section.id 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {section.icon}
                  {section.title}
                </button>
              ))}
            </nav>

            <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 mt-8">
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase mb-3">
                <CheckCircle2 size={14} />
                <span>Actualizado</span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] leading-tight">
                Última revisión: 28 de Diciembre, 2025. Cumplimos con las normativas internacionales de protección de datos.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[2.5rem] p-8 md:p-12 shadow-sm min-h-[60vh]">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="prose prose-slate dark:prose-invert max-w-none"
          >
            {activeSection === 'terms' && (
              <>
                <h1 className="text-3xl font-black text-[var(--text-main)] mb-8 flex items-center gap-3">
                  <FileText className="text-primary" />
                  Términos de Servicio
                </h1>
                <p className="text-lg text-[var(--text-muted)] mb-8 leading-relaxed">
                  Bienvenido a Teach LAOZ. Al acceder a nuestra plataforma, aceptas estar sujeto a los siguientes términos y condiciones.
                </p>
                
                <section className="mb-10">
                  <h2 className="text-xl font-bold text-[var(--text-main)] mb-4">1. Uso de la Licencia</h2>
                  <p className="text-[var(--text-muted)] leading-relaxed">
                    Se concede permiso para descargar temporalmente una copia de los materiales (información o software) en el sitio web de Teach LAOZ para visualización transitoria personal y no comercial únicamente.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-bold text-[var(--text-main)] mb-4">2. Cuentas de Usuario</h2>
                  <p className="text-[var(--text-muted)] leading-relaxed">
                    Eres responsable de mantener la confidencialidad de tu cuenta y contraseña. Teach LAOZ se reserva el derecho de rechazar el servicio o cancelar cuentas a su entera discreción.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-bold text-[var(--text-main)] mb-4">3. Restricciones</h2>
                  <p className="text-[var(--text-muted)] leading-relaxed mb-4">No debes bajo ninguna circunstancia:</p>
                  <ul className="list-disc pl-6 space-y-2 text-[var(--text-muted)]">
                    <li>Copiar o modificar los materiales.</li>
                    <li>Utilizar los materiales para cualquier fin comercial.</li>
                    <li>Intentar descompilar o realizar ingeniería inversa de cualquier software contenido en Teach LAOZ.</li>
                  </ul>
                </section>
              </>
            )}

            {activeSection === 'privacy' && (
              <>
                <h1 className="text-3xl font-black text-[var(--text-main)] mb-8 flex items-center gap-3">
                  <Lock className="text-primary" />
                  Política de Privacidad
                </h1>
                <p className="text-lg text-[var(--text-muted)] mb-8 leading-relaxed">
                  Tu privacidad es importante para nosotros. Es política de Teach LAOZ respetar tu privacidad con respecto a cualquier información que podamos recopilar.
                </p>
                
                <section className="mb-10">
                  <h2 className="text-xl font-bold text-[var(--text-main)] mb-4">Recopilación de Datos</h2>
                  <p className="text-[var(--text-muted)] leading-relaxed">
                    Solo solicitamos información personal cuando realmente la necesitamos para brindarte un servicio. Lo hacemos por medios justos y legales, con tu conocimiento y consentimiento.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-bold text-[var(--text-main)] mb-4">Protección de la Información</h2>
                  <p className="text-[var(--text-muted)] leading-relaxed">
                    Protegemos los datos almacenados dentro de medios comercialmente aceptables para evitar pérdidas y robos, así como el acceso, divulgación, copia, uso o modificación no autorizados.
                  </p>
                </section>
              </>
            )}

            {activeSection === 'cookies' && (
              <>
                <h1 className="text-3xl font-black text-[var(--text-main)] mb-8 flex items-center gap-3">
                  <Eye className="text-primary" />
                  Política de Cookies
                </h1>
                <p className="text-lg text-[var(--text-muted)] mb-8 leading-relaxed">
                  Utilizamos cookies para mejorar tu experiencia en nuestro sitio.
                </p>
                
                <section className="mb-10">
                  <h2 className="text-xl font-bold text-[var(--text-main)] mb-4">¿Qué son las cookies?</h2>
                  <p className="text-[var(--text-muted)] leading-relaxed">
                    Las cookies son pequeños archivos de texto que se utilizan para almacenar pequeñas piezas de información. Se almacenan en tu dispositivo cuando se carga el sitio web en tu navegador.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-bold text-[var(--text-main)] mb-4">Cómo las usamos</h2>
                  <p className="text-[var(--text-muted)] leading-relaxed">
                    Utilizamos cookies propias y de terceros para varios propósitos. Las cookies propias son mayormente necesarias para que el sitio funcione correctamente, y no recopilan ninguno de tus datos identificables.
                  </p>
                </section>
              </>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};
