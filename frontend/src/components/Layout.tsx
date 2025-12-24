import React from 'react';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { Outlet } from 'react-router-dom';

export const Layout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 print:hidden" />
        <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-secondary/5 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2 print:hidden" />
        
        <div className="flex-1 overflow-y-auto mt-0 custom-scrollbar print:overflow-visible">
          <div className="px-8 py-10 lg:px-12 xl:px-20 min-h-[calc(100vh-80px)] print:p-0 print:m-0">
            <Outlet />
          </div>
          <Footer />
        </div>
      </main>
    </div>
  );
};
