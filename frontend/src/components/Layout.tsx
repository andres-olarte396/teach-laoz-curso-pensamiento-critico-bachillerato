import React from 'react';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { Outlet } from 'react-router-dom';

import { Menu } from 'lucide-react';

export const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-300">
      <Sidebar mobileIsOpen={mobileMenuOpen} setMobileIsOpen={setMobileMenuOpen} />
      
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 flex items-center justify-between bg-[var(--bg-surface)] border-b border-[var(--border-color)] text-[var(--text-main)] sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
               <span className="text-white font-black italic text-lg pr-0.5">L</span>
             </div>
             <span className="text-sm font-bold tracking-tight">Teach LAOZ</span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-slate-400 hover:text-white"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Backdrop for Mobile Menu */}
        {mobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Background Gradients */}
        <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 print:hidden" />
        <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[200px] bg-secondary/5 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2 print:hidden" />
        
        <div className="flex-1 overflow-y-auto mt-0 custom-scrollbar print:overflow-visible">
          <div className="px-4 py-8 lg:px-12 xl:px-20 min-h-[calc(100vh-80px)] print:p-0 print:m-0 content-area">
            <Outlet />
          </div>
          <Footer />
        </div>
      </main>
    </div>
  );
};
