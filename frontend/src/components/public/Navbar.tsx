/**
 * Navbar - Public Website Navigation
 * Responsive navigation with dropdown menus
 * Restructured: Curriculum-Centric Model (Jan 2026)
 */
import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Navigation structure with dropdowns
const navConfig = [
  { to: '/', label: 'Home' },
  { to: '/cultural-camps', label: 'Cultural Camps' },
  { 
    label: 'Curriculum',
    dropdown: [
      { to: '/curriculum', label: 'Learning Hub', description: 'Cḱuĺtn four pathways' },
      // Cḱuĺtn Pathways section
      { to: '/curriculum/land', label: 'tmícw — Land', description: 'Place names & stewardship', section: 'Learning Pathways' },
      { to: '/curriculum/mind', label: 'sképqin — Mind', description: 'Stories & vocabulary' },
      { to: '/curriculum/heart', label: 'púsmen — Heart', description: 'Elder wisdom' },
      { to: '/curriculum/spirit', label: 'súmec — Spirit', description: 'Laws & governance' },
      // Resources section
      { to: '/laws', label: 'Legal Traditions', description: 'Wseltktenéws', section: 'Resources' },
      { to: '/stewardship', label: 'Stewardship', description: 'Land & resources' },
      // Language Learning section
      { to: '/language', label: 'Language Hub', description: 'Learning center', section: 'Language Learning' },
      { to: '/dictionary', label: 'Dictionary', description: '12,690 words' },
      { to: '/stories', label: 'Stories', description: 'Traditional narratives' },
    ],
  },
  { to: '/territory-map', label: 'Territory Map' },
  { to: '/events', label: 'Events' },
  { to: '/projects', label: 'Projects' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];


// Dropdown component
function NavDropdown({ 
  label, 
  items, 
  isOpen, 
  onToggle, 
  onClose 
}: { 
  label: string; 
  items: Array<{ to: string; label: string; description?: string; section?: string }>; 
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const location = useLocation();
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const isActive = items.some(item => location.pathname.startsWith(item.to));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={onToggle}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1
          ${isActive
            ? 'bg-shs-forest-100 text-shs-forest-800'
            : 'text-shs-text-body hover:bg-shs-sand hover:text-shs-forest-700'
          }`}
        aria-expanded={isOpen}
      >
        {label}
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-shs-stone/30 py-2 z-50 animate-fade-in-down">
          {items.map((item) => (
            <div key={item.to}>
              {/* Section separator */}
              {item.section && (
                <div className="px-4 pt-3 pb-1 border-t border-shs-stone/20 mt-1">
                  <span className="text-xs font-bold text-shs-amber-600 uppercase tracking-wide">
                    {item.section}
                  </span>
                </div>
              )}
              <Link
                to={item.to}
                onClick={onClose}
                className={`block px-4 py-3 hover:bg-shs-forest-50 transition-colors ${
                  location.pathname === item.to ? 'bg-shs-forest-50' : ''
                }`}
              >
                <span className="font-medium text-shs-forest-800">{item.label}</span>
                {item.description && (
                  <span className="block text-xs text-shs-text-muted mt-0.5">{item.description}</span>
                )}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  return (
    <header className="sticky top-0 z-[1100] bg-white/95 backdrop-blur-md border-b border-shs-stone shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-shs-forest-600 to-shs-forest-800 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <span className="text-white font-bold text-lg md:text-xl">S</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold text-shs-forest-800 leading-tight">
                Secwépemc
              </h1>
              <p className="text-xs md:text-sm text-shs-text-muted -mt-0.5">
                Hunting Society
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navConfig.map((item) => (
              'dropdown' in item ? (
                <NavDropdown
                  key={item.label}
                  label={item.label}
                  items={item.dropdown!}
                  isOpen={openDropdown === item.label}
                  onToggle={() => toggleDropdown(item.label)}
                  onClose={() => setOpenDropdown(null)}
                />
              ) : (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive(item.to)
                      ? 'bg-shs-forest-100 text-shs-forest-800'
                      : 'text-shs-text-body hover:bg-shs-sand hover:text-shs-forest-700'
                    }`}
                >
                  {item.label}
                </Link>
              )
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/membership"
              className="px-4 py-2 text-sm font-medium text-shs-forest-700 hover:text-shs-forest-800 transition-colors"
            >
              Membership
            </Link>
            <Link
              to="/donate"
              className="px-5 py-2.5 bg-gradient-to-r from-shs-amber-500 to-shs-amber-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-shs-amber-600 hover:to-shs-amber-700 transition-all duration-200"
            >
              Donate
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-shs-text-body hover:bg-shs-sand transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-shs-stone animate-fade-in-down">
          <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {navConfig.map((item) => (
              'dropdown' in item ? (
                <div key={item.label} className="space-y-1">
                  <div className="px-4 py-2 text-xs font-bold text-shs-forest-600 uppercase tracking-wide">
                    {item.label}
                  </div>
                  {'dropdown' in item && item.dropdown && item.dropdown.map((subItem) => (
                    <Link
                      key={subItem.to}
                      to={subItem.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-4 py-3 pl-8 rounded-lg text-base font-medium transition-colors
                        ${isActive(subItem.to)
                          ? 'bg-shs-forest-100 text-shs-forest-800'
                          : 'text-shs-text-body hover:bg-shs-sand'
                        }`}
                    >
                      {subItem.label}
                      {subItem.description && (
                        <span className="block text-xs text-shs-text-muted">{subItem.description}</span>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors
                    ${isActive(item.to)
                      ? 'bg-shs-forest-100 text-shs-forest-800'
                      : 'text-shs-text-body hover:bg-shs-sand'
                    }`}
                >
                  {item.label}
                </Link>
              )
            ))}
            <div className="pt-4 border-t border-shs-stone mt-4 space-y-2">
              <Link
                to="/membership"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-center font-medium text-shs-forest-700 border border-shs-forest-200 rounded-lg hover:bg-shs-forest-50 transition-colors"
              >
                Membership
              </Link>
              <Link
                to="/donate"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-center font-semibold text-white bg-gradient-to-r from-shs-amber-500 to-shs-amber-600 rounded-lg shadow-md"
              >
                Donate
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
