
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="rounded-full p-2 transition-colors hover:bg-secondary dark:hover:bg-secondary/30"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon size={18} className="text-foreground" />
      ) : (
        <Sun size={18} className="text-foreground" />
      )}
    </button>
  );
};

export default ThemeToggle;
