import React, { useState, useEffect } from 'react';
import { Cross, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  transparent?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ transparent = true }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      transparent && !scrolled 
        ? 'bg-transparent' 
        : 'bg-white/80 backdrop-blur-lg shadow-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                <Cross className="w-6 h-6 text-white" />
              </div>
              <span className={`text-xl font-bold ${transparent && !scrolled ? 'text-white' : 'bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent'}`}>
                Diagnosa
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('features')}
              className={`font-medium transition-colors ${transparent && !scrolled ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-blue-600'}`}
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('testimonials')}
              className={`font-medium transition-colors ${transparent && !scrolled ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-blue-600'}`}
            >
              Reviews
            </button>
            <a 
              href="https://bolt.new" 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-4"
            >
              <img 
                src="/black_circle_360x360.png" 
                alt="Powered by Bolt.new" 
                className="w-8 h-8 transition-transform hover:scale-110"
              />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-md ${
                transparent && !scrolled ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button
              onClick={() => scrollToSection('features')}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 w-full text-left"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('testimonials')}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 w-full text-left"
            >
              Reviews
            </button>
            <a 
              href="https://bolt.new" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center px-3 py-2"
            >
              <img 
                src="/black_circle_360x360.png" 
                alt="Powered by Bolt.new" 
                className="w-8 h-8"
              />
              <span className="ml-2 text-gray-700">Powered by Bolt.new</span>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};