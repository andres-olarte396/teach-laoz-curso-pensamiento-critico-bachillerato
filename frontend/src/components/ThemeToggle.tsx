import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 p-1 rounded-full bg-slate-950 border border-slate-800 shadow-inner">
      <button
        onClick={() => setTheme("light")}
        className={`p-1.5 rounded-full transition-all duration-300 ${
          theme === "light"
            ? "bg-amber-400 text-amber-950 shadow-lg shadow-amber-400/20 scale-105"
            : "text-slate-500 hover:text-amber-400"
        }`}
        title="Modo Claro"
      >
        <Sun size={14} className={theme === "light" ? "fill-current" : ""} />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`p-1.5 rounded-full transition-all duration-300 ${
          theme === "system"
            ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20 scale-105"
            : "text-slate-500 hover:text-sky-400"
        }`}
        title="Sistema"
      >
        <Monitor size={14} />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-1.5 rounded-full transition-all duration-300 ${
          theme === "dark"
            ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 scale-105"
            : "text-slate-500 hover:text-indigo-400"
        }`}
        title="Modo Oscuro"
      >
        <Moon size={14} className={theme === "dark" ? "fill-current" : ""} />
      </button>
    </div>
  );
};
