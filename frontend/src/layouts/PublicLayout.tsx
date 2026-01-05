/**
 * PublicLayout - Main layout wrapper for public-facing pages
 * Provides consistent navbar, footer, and page structure
 */
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/public/Navbar';
import { Footer } from '../components/public/Footer';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-shs-cream text-gray-900" style={{ colorScheme: 'light' }}>
      {/* Skip to content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-shs-forest-600 focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>
      
      <Navbar />
      
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
}
