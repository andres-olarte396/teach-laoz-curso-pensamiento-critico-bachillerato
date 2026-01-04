import React from 'react';
import { ChevronRight, ChevronDown, Folder, FileText, Search, LogOut, Mail, Map, Users, Award, Book, LifeBuoy, Shield, PanelLeftClose, FileCode, FileVideo, FileAudio, Activity, LogIn } from 'lucide-react';
import { useMenu } from '../hooks/useMenu';
import { apiService, type MenuItem } from '../services/apiService';
import { Link, useLocation } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AccessibilityMenu } from './AccessibilityMenu';
import { useAuth } from '../context/AuthContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NavItemProps {
  item: MenuItem;
  depth?: number;
  isCollapsed?: boolean;
  continuePath?: string;
}

const NavItem: React.FC<NavItemProps> = ({ item, depth = 0, isCollapsed = false, continuePath }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const isActive = location.pathname === `/course/${item.path}` || location.pathname === `/evaluation/${item.path}`;
  const hasChildren = item.children && item.children.length > 0;

  const toggleOpen = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="group/nav relative">
        <Link
          to={
            item.type === 'evaluation' 
              ? `/evaluation/${item.path}` 
              : (item.type === 'markdown' || item.type === 'binary' || item.type === 'html') 
                ? `/course/${item.path}` 
                : '#'
          }
          onClick={toggleOpen}
          className={cn(
            "flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 group relative",
            isActive ? "bg-primary/20 text-primary border-primary/30" : "hover:bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)]",
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
            <span className="text-sm font-medium leading-tight break-words line-clamp-2 flex-1">
              {item.title}
            </span>
          )}
        </Link>

        {(!isCollapsed && depth === 0 && continuePath) && (
          <Link
            to={continuePath.includes('evaluacion') ? `/evaluation/${continuePath}` : `/course/${continuePath}`}
            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/nav:opacity-100 transition-all bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
          >
            Continuar
          </Link>
        )}
      </div>
      
      {!isCollapsed && hasChildren && isOpen && (
        <div className="mt-1 flex flex-col gap-1 ml-3 pl-2 border-l border-[var(--border-color)]">
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
  const { logout, user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = React.useState(true);
  const [inProgressCourseIds, setInProgressCourseIds] = React.useState<Set<string>>(new Set());
  const [courseLatestLessons, setCourseLatestLessons] = React.useState<Record<string, string>>({});

  // Fetch all progress to determine which courses to show in sidebar and where to continue
  React.useEffect(() => {
    const fetchProgress = async () => {
      if (user) {
        try {
          const progress = await apiService.getAllProgress();
          
          // Map to find latest lesson for each course
          const latestMap: Record<string, { path: string; date: Date }> = {};
          const ids = new Set<string>();
          
          progress.forEach((p: any) => {
            ids.add(p.courseId);
            const pDate = new Date(p.lastAccessedAt);
            if (!latestMap[p.courseId] || pDate > latestMap[p.courseId].date) {
              latestMap[p.courseId] = { path: p.lessonId, date: pDate };
            }
          });

          setInProgressCourseIds(ids);
          
          const finalMap: Record<string, string> = {};
          Object.entries(latestMap).forEach(([id, data]) => {
            finalMap[id] = data.path;
          });
          setCourseLatestLessons(finalMap);
        } catch (err) {
          console.error('Failed to fetch user progress:', err);
        }
      }
    };
    fetchProgress();
  }, [user, location.pathname]); // Update on navigation too to refresh progress

  // Filter courses: only show those that are in progress
  const visibleCourses = courses.filter(course => inProgressCourseIds.has(course.id));

  // Close mobile menu when navigating
  React.useEffect(() => {
    if (mobileIsOpen && setMobileIsOpen) {
      setMobileIsOpen(false);
    }
  }, [location.pathname]); // Only close on path change

  return (
    <aside className={cn(
      "h-screen border-r border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-col sticky top-0 z-50 print:hidden text-[var(--text-main)] transition-all duration-300",
      isCollapsed ? "w-20" : "w-72",
      // Simple mobile visibility toggle
      "hidden lg:flex",
      mobileIsOpen ? "fixed inset-y-0 left-0 z-50 flex shadow-2xl" : ""
    )}>
      <div className="p-6 pb-2 relative group">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 bg-[var(--bg-surface)] text-[var(--text-muted)] p-1 rounded-full border border-[var(--border-color)] hover:text-[var(--text-main)] transition-colors opacity-0 group-hover:opacity-100 lg:flex hidden shadow-sm z-10"
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
              <span className="text-xl font-black text-[var(--text-main)] tracking-tighter leading-none whitespace-nowrap">
                Teach <span className="text-emerald-500 italic">LAOZ</span>
              </span>
              <span className="text-[0.65rem] text-[var(--text-muted)] font-bold tracking-[0.2em] uppercase whitespace-nowrap">
                Learning System
              </span>
            </div>
          )}
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--border-color)] to-transparent mb-2" />
      </div>

      <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 custom-scrollbar">
        
        {/* PLATAFORMA SECTION */}
        {isAuthenticated && (
        <div>
          {!isCollapsed && <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3 px-3">Plataforma</h2>}
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
                      <div key={i} className="h-6 bg-[var(--bg-app)] animate-pulse rounded-md" />
                    ))}
                  </div>
                )}

                {error && (
                  <div className="px-3 py-2 text-xs text-red-400 bg-red-400/10 rounded-lg">
                    Error al cargar cursos.
                  </div>
                )}

                {/* Explorar Cursos Link */}
                <Link 
                  to="/courses" 
                  className={clsx(
                    "flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[var(--bg-app)] transition-all font-medium mb-1",
                    location.pathname.startsWith("/courses") ? "text-primary bg-[var(--bg-app)]" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  )}
                  title="Explorar todos los cursos"
                >
                  <span className="w-4 h-4 flex items-center justify-center"><Search size={14} /></span>
                  {!isCollapsed && <span>Explorar Cursos</span>}
                </Link>

                {/* Course Categories (if not collapsed) */}
                    <div className="ml-4 pl-3 border-l border-[var(--border-color)] flex flex-col gap-1 mb-2">
                       <Link 
                         to="/courses/category/tecnologia-software" 
                         className={clsx(
                           "text-xs py-1.5 px-2 rounded-md transition-colors",
                           location.pathname === "/courses/category/tecnologia-software" ? "text-primary font-semibold bg-[var(--bg-app)]" : "text-[var(--text-muted)] hover:bg-[var(--bg-app)] hover:text-[var(--text-main)]"
                         )}
                       >
                         Tecnología & Software
                       </Link>
                       <Link 
                         to="/courses/category/finanzas-economia" 
                         className={clsx(
                           "text-xs py-1.5 px-2 rounded-md transition-colors",
                           location.pathname === "/courses/category/finanzas-economia" ? "text-primary font-semibold bg-[var(--bg-app)]" : "text-[var(--text-muted)] hover:bg-[var(--bg-app)] hover:text-[var(--text-main)]"
                         )}
                       >
                         Finanzas & Economía
                       </Link>
                       <Link 
                         to="/courses/category/educacion-soft-skills" 
                         className={clsx(
                           "text-xs py-1.5 px-2 rounded-md transition-colors",
                           location.pathname === "/courses/category/educacion-soft-skills" ? "text-primary font-semibold bg-[var(--bg-app)]" : "text-[var(--text-muted)] hover:bg-[var(--bg-app)] hover:text-[var(--text-main)]"
                         )}
                       >
                         Educación & Soft Skills
                       </Link>
                       <Link 
                         to="/courses/category/datos-analitica" 
                         className={clsx(
                           "text-xs py-1.5 px-2 rounded-md transition-colors",
                           location.pathname === "/courses/category/datos-analitica" ? "text-primary font-semibold bg-[var(--bg-app)]" : "text-[var(--text-muted)] hover:bg-[var(--bg-app)] hover:text-[var(--text-main)]"
                         )}
                       >
                         Datos & Analítica
                       </Link>
                    </div>

                {visibleCourses.map((course) => (
                  <NavItem 
                    key={course.id} 
                    item={course} 
                    isCollapsed={isCollapsed} 
                    continuePath={courseLatestLessons[course.id]}
                  />
                ))}
               </>
             )}

            <Link 
              to="/learning-paths" 
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all font-medium"
              title="Rutas de aprendizaje"
            >
              <span className="w-4 h-4 flex items-center justify-center"><Map size={14} /></span>
              {!isCollapsed && <span>Rutas de aprendizaje</span>}
            </Link>

            <Link 
              to="/community" 
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all font-medium"
               title="Comunidad"
            >
              <span className="w-4 h-4 flex items-center justify-center"><Users size={14} /></span>
              {!isCollapsed && <span>Comunidad</span>}
            </Link>

            <Link 
              to="/certifications" 
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all font-medium"
               title="Certificaciones"
            >
              <span className="w-4 h-4 flex items-center justify-center"><Award size={14} /></span>
              {!isCollapsed && <span>Certificaciones</span>}
            </Link>

            <Link 
              to="/admin/evaluations" 
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all font-medium"
               title="Monitor IA"
            >
              <span className="w-4 h-4 flex items-center justify-center"><Activity size={14} /></span>
              {!isCollapsed && <span>Monitor IA</span>}
            </Link>

            <Link 
              to="/grades" 
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all font-medium"
               title="Mis Calificaciones"
            >
              <span className="w-4 h-4 flex items-center justify-center"><Award size={14} /></span>
              {!isCollapsed && <span>Mis Calificaciones</span>}
            </Link>
          </div>
        </div>

        )}

        {/* RECURSOS SECTION */}
        <div>
          {!isCollapsed && <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3 px-3">Recursos</h2>}
          <div className="space-y-1">
            <Link 
              to="/documentation" 
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all font-medium"
               title="Documentación"
            >
              <span className="w-4 h-4 flex items-center justify-center"><Book size={14} /></span>
              {!isCollapsed && <span>Documentación</span>}
            </Link>

             <div className="flex flex-col gap-1">
              <Link 
                to="/blog" 
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all font-medium group"
                title="Blog"
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center"><Book size={14} /></span>
                  {!isCollapsed && <span>Blog & Updates</span>}
                </div>
              </Link>
              
              {!isCollapsed && (
                <div className="ml-4 pl-3 border-l border-[var(--border-color)] flex flex-col gap-1 mt-1">
                  <Link 
                    to="/blog" 
                    className={clsx(
                      "text-xs py-1.5 px-2 rounded-md transition-colors",
                      location.pathname === "/blog" ? "text-emerald-500 font-semibold bg-[var(--bg-app)]" : "text-[var(--text-muted)] hover:bg-[var(--bg-app)] hover:text-[var(--text-main)]"
                    )}
                  >
                    Todo
                  </Link>
                  <Link 
                    to="/blog/category/tecnologia-software" 
                    className={clsx(
                      "text-xs py-1.5 px-2 rounded-md transition-colors",
                      location.pathname === "/blog/category/tecnologia-software" ? "text-emerald-500 font-semibold bg-[var(--bg-app)]" : "text-[var(--text-muted)] hover:bg-[var(--bg-app)] hover:text-[var(--text-main)]"
                    )}
                  >
                    Tecnología Software
                  </Link>
                  <Link 
                    to="/blog/category/medio-ambiente-sostenibilidad" 
                    className={clsx(
                      "text-xs py-1.5 px-2 rounded-md transition-colors",
                      location.pathname === "/blog/category/medio-ambiente-sostenibilidad" ? "text-emerald-500 font-semibold bg-[var(--bg-app)]" : "text-[var(--text-muted)] hover:bg-[var(--bg-app)] hover:text-[var(--text-main)]"
                    )}
                  >
                    Medio Ambiente
                  </Link>
                  <Link 
                    to="/blog/category/fitness-salud" 
                    className={clsx(
                      "text-xs py-1.5 px-2 rounded-md transition-colors",
                      location.pathname === "/blog/category/fitness-salud" ? "text-emerald-500 font-semibold bg-[var(--bg-app)]" : "text-[var(--text-muted)] hover:bg-[var(--bg-app)] hover:text-[var(--text-main)]"
                    )}
                  >
                    Fitness & Salud
                  </Link>
                  <Link 
                    to="/blog/category/desarrollo-personal-psicologia" 
                    className={clsx(
                      "text-xs py-1.5 px-2 rounded-md transition-colors",
                      location.pathname === "/blog/category/desarrollo-personal-psicologia" ? "text-emerald-500 font-semibold bg-[var(--bg-app)]" : "text-[var(--text-muted)] hover:bg-[var(--bg-app)] hover:text-[var(--text-main)]"
                    )}
                  >
                    Desarrollo Personal
                  </Link>
                  <Link 
                    to="/blog/category/finanzas-productividad" 
                    className={clsx(
                      "text-xs py-1.5 px-2 rounded-md transition-colors",
                      location.pathname === "/blog/category/finanzas-productividad" ? "text-emerald-500 font-semibold bg-[var(--bg-app)]" : "text-[var(--text-muted)]/60 hover:bg-[var(--bg-app)] hover:text-[var(--text-main)]"
                    )}
                  >
                    Finanzas & Productividad
                  </Link>
                </div>
              )}
            </div>

            <Link 
              to="/support" 
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all font-medium"
               title="Soporte"
            >
              <span className="w-4 h-4 flex items-center justify-center"><LifeBuoy size={14} /></span>
              {!isCollapsed && <span>Soporte</span>}
            </Link>

             <Link 
              to="/terms" 
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all font-medium"
               title="Términos"
            >
              <span className="w-4 h-4 flex items-center justify-center"><Shield size={14} /></span>
              {!isCollapsed && <span>Términos</span>}
            </Link>
             
             <Link 
              to="/contact" 
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all font-medium mt-2"
               title="Contáctanos"
            >
              <span className="w-4 h-4 flex items-center justify-center"><Mail size={14} /></span>
               {!isCollapsed && <span>Contáctanos</span>}
            </Link>

            {!isAuthenticated && (
              <Link 
                to="/login" 
                className="flex items-center gap-2 py-2 px-3 rounded-lg text-primary bg-primary/10 hover:bg-primary/20 transition-all font-bold mt-4"
                title="Iniciar Sesión"
              >
                <span className="w-4 h-4 flex items-center justify-center"><LogIn size={14} /></span>
                {!isCollapsed && <span>Iniciar Sesión</span>}
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="border-t border-[var(--border-color)] bg-[var(--bg-surface)]">
        <div className={cn(
          "transition-all",
          isCollapsed ? "p-3 flex flex-col items-center gap-4" : "p-4"
        )}>
          {isCollapsed ? (
            <>
              {isAuthenticated && (
                <Link to="/profile" className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-xs shadow-md hover:scale-105 transition-transform" title="Mi Perfil">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </Link>
              )}
              
              <div className="flex flex-col gap-2">
                <div className="relative z-50 flex justify-center">
                    <AccessibilityMenu />
                </div>
                {isAuthenticated && (
                  <button 
                    onClick={logout}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-500/10 transition-all"
                    title="Cerrar Sesión"
                  >
                    <LogOut size={16} />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
               {isAuthenticated && (
                 <Link to="/profile" className="flex items-center gap-3 flex-1 min-w-0 hover:bg-[var(--bg-app)] rounded-lg p-1 transition-colors -ml-1">
                   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                   </div>
                   <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-bold text-[var(--text-main)] truncate leading-tight">{user?.name || 'Estudiante'}</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest opacity-70">Premium Plan</span>
                   </div>
                 </Link>
               )}
               <div className="flex items-center gap-1">
                 <div className="relative z-50">
                    <AccessibilityMenu />
                 </div>
                 {isAuthenticated && (
                   <button 
                      onClick={logout}
                      className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Cerrar Sesión"
                   >
                      <LogOut size={18} />
                   </button>
                 )}
               </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
