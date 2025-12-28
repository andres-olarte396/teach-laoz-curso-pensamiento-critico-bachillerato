import React from 'react';
import { ChevronRight, ChevronDown, Folder, FileText, LogOut, Mail, Map, Users, Award, Book, LifeBuoy, Shield, PanelLeftClose, FileCode, FileVideo, FileAudio } from 'lucide-react';
import { useMenu } from '../hooks/useMenu';
import type { MenuItem } from '../services/apiService';
import { Link, useLocation } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NavItemProps {
  item: MenuItem;
  depth?: number;
  isCollapsed?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ item, depth = 0, isCollapsed = false }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const isActive = location.pathname === `/course/${item.path}`;
  const hasChildren = item.children && item.children.length > 0;

  const toggleOpen = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="flex flex-col">
      <Link
        to={(item.type === 'markdown' || item.type === 'binary' || item.type === 'html') ? `/course/${item.path}` : '#'}
        onClick={toggleOpen}
        className={cn(
          "flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 group relative",
          isActive ? "bg-primary/20 text-primary border-primary/30" : "hover:bg-slate-900 text-slate-400 hover:text-slate-100",
          isCollapsed && "justify-center"
        )}
        title={item.title}
      >
        <span className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
          {hasChildren ? (
            isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            item.type === 'directory' ? <Folder size={14} /> : 
            item.path.toLowerCase().endsWith('.mp4') ? <FileVideo size={14} className="text-blue-500" /> :
            (item.path.toLowerCase().endsWith('.mp3') || item.path.toLowerCase().endsWith('.wav') || item.path.toLowerCase().endsWith('.ogg')) ? <FileAudio size={14} className="text-purple-500" /> :
            item.path.toLowerCase().endsWith('.html') ? <FileCode size={14} className="text-orange-500" /> :
            item.path.toLowerCase().endsWith('.pdf') ? <FileText size={14} className="text-red-500" /> :
            <FileText size={14} />
          )}
        </span>
        {!isCollapsed && (
          <span className="text-sm font-medium leading-tight break-words line-clamp-2">
            {item.title}
          </span>
        )}
      </Link>
      
      {!isCollapsed && hasChildren && isOpen && (
        <div className="mt-1 flex flex-col gap-1 ml-3 pl-2 border-l border-slate-800">
          {item.children?.map((child) => (
            <NavItem key={child.id} item={child} depth={depth + 1} isCollapsed={isCollapsed} />
          ))}
        </div>
      )}
    </div>
  );
};

interface SidebarProps {
  mobileIsOpen?: boolean;
  setMobileIsOpen?: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileIsOpen, setMobileIsOpen }) => {
  const { courses, loading, error } = useMenu();
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = React.useState(true);

  // Close mobile menu when navigating
  const location = useLocation();
  React.useEffect(() => {
    if (mobileIsOpen && setMobileIsOpen) {
      setMobileIsOpen(false);
    }
  }, [location.pathname]); // Only close on path change

  return (
    <aside className={cn(
      "dark h-screen border-r border-zinc-800 bg-[#020617] flex flex-col sticky top-0 print:hidden text-zinc-200 transition-all duration-300",
      isCollapsed ? "w-20" : "w-72",
      // Simple mobile visibility toggle (if not hidden by default, we might need more complex CSS, but this fixes the build signature)
      "hidden lg:flex", // Hide on mobile by default unless we implement the drawer logic strictly
      mobileIsOpen ? "fixed inset-y-0 left-0 z-50 flex" : "" // Show when mobileIsOpen is true (simplified)
    )}>
      <div className="p-6 pb-2 relative group">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 bg-slate-800 text-slate-400 p-1 rounded-full border border-slate-700 hover:text-white hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100 lg:flex hidden"
          title={isCollapsed ? "Expandir menú" : "Contraer menú"}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <PanelLeftClose size={14} />}
        </button>

        {/* Mobile Close Button */}
        {mobileIsOpen && (
          <button 
            onClick={() => setMobileIsOpen?.(false)}
            className="lg:hidden absolute right-4 top-6 p-2 text-slate-400 hover:text-white"
          >
            <ChevronRight className="rotate-180" size={24} />
          </button>
        )}

        <div className={cn("flex items-center gap-3 mb-6", isCollapsed && "justify-center")}>
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center border border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] shrink-0">
           <span className="text-white font-black italic text-2xl pr-0.5">L</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-xl font-black text-white tracking-tighter leading-none whitespace-nowrap">
                Teach <span className="text-emerald-500 italic">LAOZ</span>
              </span>
              <span className="text-[0.65rem] text-slate-500 font-bold tracking-[0.2em] uppercase whitespace-nowrap">
                Learning System
              </span>
            </div>
          )}
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent mb-2" />
      </div>

      <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 custom-scrollbar">
        
        {/* PLATAFORMA SECTION */}
        <div>
          {!isCollapsed && <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-3">Plataforma</h2>}
          <div className="space-y-1">
             <button 
                onClick={() => !isCollapsed && setIsCoursesOpen(!isCoursesOpen)}
                className={cn(
                  "w-full px-3 py-2 flex items-center gap-2 text-primary bg-primary/10 rounded-lg mb-2 transition-all hover:bg-primary/20", 
                  isCollapsed && "justify-center cursor-default bg-transparent hover:bg-transparent p-0"
                )}
                title={isCollapsed ? "Cursos" : (isCoursesOpen ? "Contraer cursos" : "Expandir cursos")}
             >
                {!isCollapsed ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Folder size={14} />
                      <span className="text-xs font-bold tracking-wider uppercase">Cursos</span>
                    </div>
                    {isCoursesOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </div>
                ) : (
                  <div className="w-full flex justify-center py-2 bg-primary/10 rounded-lg">
                    <Folder size={16} />
                  </div>
                )}
             </button>
             
             {/* Dynamic Courses List */}
             {(!isCollapsed && isCoursesOpen) && (
               <>
                 {loading && (
                  <div className="px-3 space-y-2">
                    {[1, 2].map(i => (
                      <div key={i} className="h-6 bg-slate-900/50 animate-pulse rounded-md" />
                    ))}
                  </div>
                )}

                {error && (
                  <div className="px-3 py-2 text-xs text-red-400 bg-red-400/10 rounded-lg">
                    Error al cargar cursos.
                  </div>
                )}

                {courses.map((course) => (
                  <NavItem key={course.id} item={course} isCollapsed={isCollapsed} />
                ))}
               </>
             )}

            <Link 
              to="/learning-paths" 
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-slate-100 transition-all font-medium"
              title="Rutas de aprendizaje"
            >
              <span className="w-4 h-4 flex items-center justify-center"><Map size={14} /></span>
              {!isCollapsed && <span>Rutas de aprendizaje</span>}
            </Link>

            <Link 
              to="/community" 
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-slate-100 transition-all font-medium"
               title="Comunidad"
            >
              <span className="w-4 h-4 flex items-center justify-center"><Users size={14} /></span>
              {!isCollapsed && <span>Comunidad</span>}
            </Link>

            <Link 
              to="/certifications" 
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-slate-100 transition-all font-medium"
               title="Certificaciones"
            >
              <span className="w-4 h-4 flex items-center justify-center"><Award size={14} /></span>
              {!isCollapsed && <span>Certificaciones</span>}
            </Link>
          </div>
        </div>

        {/* RECURSOS SECTION */}
        <div>
          {!isCollapsed && <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-3">Recursos</h2>}
          <div className="space-y-1">
            <Link 
              to="/documentation" 
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-slate-100 transition-all font-medium"
               title="Documentación"
            >
              <span className="w-4 h-4 flex items-center justify-center"><Book size={14} /></span>
              {!isCollapsed && <span>Documentación</span>}
            </Link>

             <div className="flex flex-col gap-1">
              <Link 
                to="/blog" 
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-slate-100 transition-all font-medium group"
                title="Blog"
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center"><Book size={14} /></span>
                  {!isCollapsed && <span>Blog & Updates</span>}
                </div>
              </Link>
              
              {!isCollapsed && (
                <div className="ml-4 pl-3 border-l border-slate-800 flex flex-col gap-1 mt-1">
                  <Link 
                    to="/blog" 
                    className={clsx(
                      "text-xs py-1.5 px-2 rounded-md transition-colors",
                      location.pathname === "/blog" ? "text-emerald-500 font-semibold bg-slate-900" : "text-slate-500 hover:bg-slate-900 hover:text-slate-300"
                    )}
                  >
                    Todo
                  </Link>
                  <Link 
                    to="/blog/category/tecnologia-software" 
                    className={clsx(
                      "text-xs py-1.5 px-2 rounded-md transition-colors",
                      location.pathname === "/blog/category/tecnologia-software" ? "text-emerald-500 font-semibold bg-slate-900" : "text-slate-500 hover:bg-slate-900 hover:text-slate-300"
                    )}
                  >
                    Tecnología Software
                  </Link>
                  <Link 
                    to="/blog/category/medio-ambiente-sostenibilidad" 
                    className={clsx(
                      "text-xs py-1.5 px-2 rounded-md transition-colors",
                      location.pathname === "/blog/category/medio-ambiente-sostenibilidad" ? "text-emerald-500 font-semibold bg-slate-900" : "text-slate-500 hover:bg-slate-900 hover:text-slate-300"
                    )}
                  >
                    Medio Ambiente
                  </Link>
                  <Link 
                    to="/blog/category/fitness-salud" 
                    className={clsx(
                      "text-xs py-1.5 px-2 rounded-md transition-colors",
                      location.pathname === "/blog/category/fitness-salud" ? "text-emerald-500 font-semibold bg-slate-900" : "text-slate-500 hover:bg-slate-900 hover:text-slate-300"
                    )}
                  >
                    Fitness & Salud
                  </Link>
                  <Link 
                    to="/blog/category/desarrollo-personal-psicologia" 
                    className={clsx(
                      "text-xs py-1.5 px-2 rounded-md transition-colors",
                      location.pathname === "/blog/category/desarrollo-personal-psicologia" ? "text-emerald-500 font-semibold bg-slate-900" : "text-slate-500 hover:bg-slate-900 hover:text-slate-300"
                    )}
                  >
                    Desarrollo Personal
                  </Link>
                  <Link 
                    to="/blog/category/finanzas-productividad" 
                    className={clsx(
                      "text-xs py-1.5 px-2 rounded-md transition-colors",
                      location.pathname === "/blog/category/finanzas-productividad" ? "text-emerald-500 font-semibold bg-slate-900" : "text-slate-500 hover:bg-slate-900 hover:text-slate-300"
                    )}
                  >
                    Finanzas & Productividad
                  </Link>
                </div>
              )}
            </div>

            <Link 
              to="/support" 
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-slate-100 transition-all font-medium"
               title="Soporte"
            >
              <span className="w-4 h-4 flex items-center justify-center"><LifeBuoy size={14} /></span>
              {!isCollapsed && <span>Soporte</span>}
            </Link>

             <Link 
              to="/terms" 
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-slate-100 transition-all font-medium"
               title="Términos"
            >
              <span className="w-4 h-4 flex items-center justify-center"><Shield size={14} /></span>
              {!isCollapsed && <span>Términos</span>}
            </Link>
             
             <Link 
              to="/contact" 
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-slate-100 transition-all font-medium mt-2"
               title="Contáctanos"
            >
              <span className="w-4 h-4 flex items-center justify-center"><Mail size={14} /></span>
               {!isCollapsed && <span>Contáctanos</span>}
            </Link>
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-900 flex flex-col gap-4">
        <button 
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all text-xs font-bold uppercase tracking-wider group"
           title="Cerrar Sesión"
        >
          <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </button>

        <div className="flex justify-center">
            <ThemeToggle isCollapsed={isCollapsed} />
        </div>
        <div className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-xl border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-medium text-slate-300 whitespace-nowrap">LMS v1.0</span>
              <span className="text-[10px] text-slate-500 whitespace-nowrap">Online</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
