import React from 'react';
import { ChevronRight, ChevronDown, Folder, FileText } from 'lucide-react';
import { useMenu } from '../hooks/useMenu';
import type { MenuItem } from '../services/apiService';
import { Link, useLocation } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ThemeToggle } from './ThemeToggle';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NavItemProps {
  item: MenuItem;
  depth?: number;
}

const NavItem: React.FC<NavItemProps> = ({ item, depth = 0 }) => {
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
        to={item.type === 'markdown' ? `/course/${item.path}` : '#'}
        onClick={toggleOpen}
        className={cn(
          "flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 group",
          isActive ? "bg-primary/20 text-primary border-primary/30" : "hover:bg-slate-900 text-slate-400 hover:text-slate-100"
        )}
      >
        <span className="w-4 h-4 flex items-center justify-center">
          {hasChildren ? (
            isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            item.type === 'directory' ? <Folder size={14} /> : <FileText size={14} />
          )}
        </span>
        <span className="text-sm truncate font-medium">{item.title}</span>
      </Link>
      
      {hasChildren && isOpen && (
        <div className="mt-1 flex flex-col gap-1 ml-5 pl-2 border-l border-slate-800">
          {item.children?.map((child) => (
            <NavItem key={child.id} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const { courses, loading, error } = useMenu();

  return (
    <aside className="w-72 h-screen border-r border-slate-900 bg-[#020617] flex flex-col sticky top-0 print:hidden text-white">
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/20 bg-primary shadow-[0_0_15px_rgba(5,150,105,0.3)]">
           <span className="text-white font-black italic text-2xl pr-0.5">L</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-white tracking-tighter leading-none">
              Teach <span className="text-primary italic">LAOZ</span>
            </span>
            <span className="text-[0.65rem] text-slate-500 font-bold tracking-[0.2em] uppercase">
              Learning System
            </span>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent mb-2" />
      </div>

      <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 custom-scrollbar">
        <div className="px-3 mb-2">
           <Link 
            to="/blog" 
            className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-900 text-slate-100 transition-all font-medium mb-4 border border-slate-800 bg-slate-900/50"
          >
            <span className="w-4 h-4 flex items-center justify-center"><FileText size={14} className="text-primary" /></span>
             <span>Blog</span>
          </Link>

          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cursos</h2>
        </div>

        {loading && (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-8 bg-slate-900/50 animate-pulse rounded-lg" />
            ))}
          </div>
        )}

        {error && (
          <div className="p-4 text-xs text-red-400 bg-red-400/10 rounded-lg">
            Error al cargar el contenido.
          </div>
        )}

        {courses.map((course) => (
          <NavItem key={course.id} item={course} />
        ))}
      </nav>

      <div className="p-4 border-t border-slate-900 flex flex-col gap-4">
        <div className="flex justify-center">
            <ThemeToggle />
        </div>
        <div className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-xl border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-300">LMS v1.0</span>
            <span className="text-[10px] text-slate-500">Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
