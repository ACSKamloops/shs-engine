import type React from 'react';
import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useAppStore, useWizardStore } from '../store';
import { useDensity } from '../contexts/DensityContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const banner = useAppStore((s) => s.banner);
  const loading = useAppStore((s) => s.loading);
  
  const setWizardOpen = useWizardStore((s) => s.setOpen);
  const setShowTour = useAppStore((s) => s.setShowTour);
  const { density, toggleDensity } = useDensity();

  return (
    <div className="min-h-screen flex bg-bg-base text-text-primary font-sans selection:bg-accent-primary-glow">
      {/* Skip to main content for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent-primary focus:text-white focus:rounded-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 md:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 glass border-b border-glass-border bg-bg-primary/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 -ml-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="hidden md:flex items-center gap-2 text-sm text-text-muted">
              <span>Pukaist Engine</span>
              <span>/</span>
              <span className="text-text-primary">Console</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
             {/* Header Actions */}
             <div className="flex items-center gap-2 mr-2">
               {/* Density Toggle */}
               <button
                 onClick={toggleDensity}
                 className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-white/5 text-text-secondary border border-white/10 rounded-lg hover:bg-white/10 hover:text-text-primary transition-colors"
                 title={`Switch to ${density === 'compact' ? 'comfortable' : 'compact'} mode`}
                 aria-label={`Current: ${density} density. Click to switch.`}
               >
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   {density === 'compact' ? (
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                   ) : (
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                   )}
                 </svg>
                 {density === 'compact' ? 'Compact' : 'Comfortable'}
               </button>
               <button
                 onClick={() => setWizardOpen(true)}
                 data-tour="wizard"
                 className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-accent-primary/10 text-accent-primary border border-accent-primary/20 rounded-lg hover:bg-accent-primary/20 hover:text-accent-primary/80 transition-colors"
               >
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                 </svg>
                 Project Wizard
               </button>
               <button
                 onClick={() => setShowTour(true)}
                 className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-white/5 text-text-secondary border border-white/10 rounded-lg hover:bg-white/10 hover:text-text-primary transition-colors"
               >
                 Tour
               </button>
             </div>

             {banner && (
              <div className={`animate-fade-in-down flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                banner.includes('error') || banner.includes('unavailable')
                  ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                  : 'bg-accent-primary/15 text-accent-primary border border-accent-primary/20'
              }`}>
                {loading && (
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                <span>{banner}</span>
              </div>
            )}
            
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-accent-primary/25">
              PK
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-x-hidden">
          <div className="max-w-[1920px] mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};