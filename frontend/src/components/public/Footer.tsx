/**
 * Footer - Public Website Footer
 * Contains contact info, newsletter signup, partner logos, and land acknowledgement
 */
import { Link } from 'react-router-dom';
import { useState } from 'react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with email service
    setSubscribed(true);
    setEmail('');
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-shs-forest-900 text-white">
      {/* Land Acknowledgement */}
      <div className="bg-shs-forest-950 py-4 border-b border-shs-forest-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-shs-forest-300 text-center italic">
            The Secwépemc Hunting Society operates on the unceded traditional territory of the Secwépemc Nation — Secwepemcúl̓ecw.
          </p>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          
          {/* About Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-shs-forest-400 to-shs-forest-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">Secwépemc</h3>
                <p className="text-shs-forest-400 text-sm -mt-0.5">Hunting Society</p>
              </div>
            </div>
            <p className="text-shs-forest-300 text-sm leading-relaxed">
              Strengthening our Secwépemc identity and culture through outdoor living, 
              traditional practices, and intergenerational knowledge sharing.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-shs-amber-400 mb-4 uppercase tracking-wide text-sm">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                { to: '/cultural-camps', label: 'Cultural Camps' },
                { to: '/curriculum', label: 'Curriculum' },
                { to: '/laws', label: 'Legal Traditions' },
                { to: '/language', label: 'Language Hub' },
                { to: '/map', label: 'Territory Map' },
                { to: '/events', label: 'Events' },
                { to: '/projects', label: 'Projects' },
                { to: '/about', label: 'About Us' },
                { to: '/donate', label: 'Donate' },
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to}
                    className="text-shs-forest-300 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-shs-amber-400 mb-4 uppercase tracking-wide text-sm">
              Contact Us
            </h4>
            <ul className="space-y-3 text-sm text-shs-forest-300">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-shs-forest-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Chase, BC<br />Secwepemcúl̓ecw Territory</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-shs-forest-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:info@secwepemchuntingsociety.ca" className="hover:text-white transition-colors">
                  info@secwepemchuntingsociety.ca
                </a>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex items-center gap-3 mt-6">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-shs-forest-800 flex items-center justify-center hover:bg-shs-forest-700 transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.77,7.46H14.5v-1.9c0-.9.6-1.1,1-1.1h3V.5h-4.33C10.24.5,9.5,3.44,9.5,5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4Z"/>
                </svg>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-shs-forest-800 flex items-center justify-center hover:bg-shs-forest-700 transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2.16c3.2,0,3.58.01,4.85.07,3.25.15,4.77,1.69,4.92,4.92.06,1.27.07,1.65.07,4.85s-.01,3.58-.07,4.85c-.15,3.23-1.66,4.77-4.92,4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85C2.38,3.92,3.9,2.38,7.15,2.23,8.42,2.17,8.8,2.16,12,2.16ZM12,0C8.74,0,8.33.01,7.05.07,2.7.27.27,2.69.07,7.05.01,8.33,0,8.74,0,12s.01,3.67.07,4.95c.2,4.36,2.62,6.78,6.98,6.98,1.28.06,1.69.07,4.95.07s3.67-.01,4.95-.07c4.35-.2,6.78-2.62,6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01,15.26,0,12,0Zm0,5.84A6.16,6.16,0,1,0,18.16,12,6.16,6.16,0,0,0,12,5.84ZM12,16a4,4,0,1,1,4-4A4,4,0,0,1,12,16ZM18.41,4.15a1.44,1.44,0,1,0,1.44,1.44A1.44,1.44,0,0,0,18.41,4.15Z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h4 className="font-semibold text-shs-amber-400 mb-4 uppercase tracking-wide text-sm">
              Stay Connected
            </h4>
            <p className="text-shs-forest-300 text-sm mb-4">
              Sign up for updates on camps, events, and community news.
            </p>
            {subscribed ? (
              <div className="bg-shs-forest-800 rounded-lg p-4 text-center">
                <svg className="w-8 h-8 text-shs-amber-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-shs-forest-200">Thank you for subscribing!</p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-2.5 bg-shs-forest-800 border border-shs-forest-700 rounded-lg text-white placeholder-shs-forest-500 focus:outline-none focus:border-shs-amber-500 focus:ring-1 focus:ring-shs-amber-500 text-sm"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-shs-amber-500 to-shs-amber-600 text-white font-semibold rounded-lg hover:from-shs-amber-600 hover:to-shs-amber-700 transition-all text-sm"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Partner Logos */}
        <div className="mt-12 pt-8 border-t border-shs-forest-800">
          <p className="text-center text-shs-forest-500 text-xs uppercase tracking-wide mb-6">
            Supported By
          </p>
          <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap">
            {/* Placeholder for partner logos - replace with actual images */}
            <div className="text-shs-forest-600 text-sm font-medium">FPCC</div>
            <div className="text-shs-forest-600 text-sm font-medium">I-SPARC</div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-shs-forest-950 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-shs-forest-500 text-xs">
            © {currentYear} Secwépemc Hunting Society. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-shs-forest-500">
            <Link to="/privacy" className="hover:text-shs-forest-300 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-shs-forest-300 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
