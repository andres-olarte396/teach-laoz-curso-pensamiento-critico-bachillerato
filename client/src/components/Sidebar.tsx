import React from 'react';
import { Book, ChevronRight, ChevronDown, Folder, FileText } from 'lucide-react';
import { useMenu } from '../hooks/useMenu';
import type { MenuItem } from '../services/apiService';
import { Link, useLocation } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
          depth > 0 && "ml-4 border-l border-slate-800",
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
        <div className="mt-1 flex flex-col gap-1">
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
    <aside className="w-72 h-screen border-r border-slate-800 bg-slate-950/50 backdrop-blur-xl flex flex-col sticky top-0 print:hidden">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(var(--color-primary),0.3)]">
          <Book className="text-white" size={24} />
        </div>
        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
          Teach LAOZ
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 custom-scrollbar">
        <div className="px-3 mb-2">
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

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-xl border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
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
