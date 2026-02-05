'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-8 right-6 md:bottom-10 md:right-8 z-[60] p-3 rounded-full glass hover:scale-110 transition-all duration-300 group shadow-lg"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-6 h-6 text-yellow-400 group-hover:text-yellow-300 group-hover:rotate-180 transition-all duration-500 drop-shadow-lg" />
      ) : (
        <Moon className="w-6 h-6 text-indigo-600 group-hover:text-indigo-700 group-hover:-rotate-90 transition-all duration-500 drop-shadow-md" />
      )}
    </button>
  );
}
