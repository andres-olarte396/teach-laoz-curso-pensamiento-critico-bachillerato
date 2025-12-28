import React from 'react';
import { Github, Twitter, Linkedin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const [social, setSocial] = React.useState({
    github: 'https://github.com',
    twitter: 'https://twitter.com',
    linkedin: 'https://linkedin.com'
  });

  React.useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await import('../services/apiService').then(m => m.apiService.getConfig());
        if (response?.data?.social) {
          setSocial(response.data.social);
        }
      } catch (error) {
        console.error('Failed to load config', error);
      }
    };
    fetchConfig();
  }, []);

  return (
    <footer className="border-t border-slate-900 bg-[#020617] print:hidden">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.3)]">
                <span className="text-white font-black text-xl italic select-none">L</span>
              </div>
              <span className="text-2xl font-black text-white tracking-tighter">
                Teach <span className="text-primary italic">LAOZ</span>
              </span>
            </div>
            <p className="text-slate-400 max-w-sm leading-relaxed mb-6">
              Plataforma de educación técnica premium diseñada para la próxima generación de desarrolladores. 
              Contenido denso, visual y directo al grano.
            </p>
            <div className="flex gap-4">
              <a href={social.github} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-primary hover:border-primary/50 transition-all duration-300">
                <Github size={20} />
              </a>
              <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-primary hover:border-primary/50 transition-all duration-300">
                <Twitter size={20} />
              </a>
              <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-primary hover:border-primary/50 transition-all duration-300">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Links Section 1 */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Plataforma</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-400 hover:text-primary transition-colors duration-200 text-sm">Cursos</a></li>
              <li><a href="#" className="text-slate-400 hover:text-primary transition-colors duration-200 text-sm">Rutas de aprendizaje</a></li>
              <li><a href="#" className="text-slate-400 hover:text-primary transition-colors duration-200 text-sm">Comunidad</a></li>
              <li><a href="#" className="text-slate-400 hover:text-primary transition-colors duration-200 text-sm">Certificaciones</a></li>
            </ul>
          </div>

          {/* Links Section 2 */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Recursos</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-400 hover:text-primary transition-colors duration-200 text-sm">Documentación</a></li>
              <li><a href="#" className="text-slate-400 hover:text-primary transition-colors duration-200 text-sm">Blog</a></li>
              <li><a href="#" className="text-slate-400 hover:text-primary transition-colors duration-200 text-sm">Soporte</a></li>
              <li><a href="#" className="text-slate-400 hover:text-primary transition-colors duration-200 text-sm">Términos</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-slate-800/30 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-sm">
          <div className="flex items-center gap-2">
            <span>© 2025 Teach LAOZ. Hecho con</span>
            <Heart size={14} className="text-red-500 fill-red-500" />
            <span>para el mundo.</span>
          </div>
          <div className="flex gap-8">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              Sistemas Operativos
            </span>
            <span>v1.2.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
