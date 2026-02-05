'use client';

import { useState, useEffect } from 'react';
import { Home, BookOpen, Code, User, Briefcase, Mail, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function Navigation() {
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Update active section based on scroll position
      const sections = ['home', 'publications', 'projects', 'about', 'experience', 'contact'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'publications', label: 'Publications', icon: BookOpen },
    { id: 'projects', label: 'Projects', icon: Code },
    { id: 'about', label: 'About', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'contact', label: 'Contact', icon: Mail },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'glass shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex-shrink-0">
            <span className="text-xl sm:text-2xl font-bold gradient-text">Portfolio</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navItems.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={`text-sm font-medium transition-colors duration-200 hover:text-primary-400 ${
                  activeSection === id
                    ? 'text-primary-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400 group-hover:text-yellow-300 group-hover:rotate-180 transition-all duration-500" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600 group-hover:text-indigo-700 group-hover:-rotate-90 transition-all duration-500" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex space-x-1 sm:space-x-2 overflow-x-auto scrollbar-hide">
            {navItems.map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0 ${
                  activeSection === id
                    ? 'text-primary-400 bg-primary-400/10'
                    : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                aria-label={navItems.find(item => item.id === id)?.label}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            ))}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
