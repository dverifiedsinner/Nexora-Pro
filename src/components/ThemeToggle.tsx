import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  return (
    <button 
      onClick={cycleTheme}
      className="p-3 rounded-2xl glass hover:bg-white/10 transition-all active:scale-95 group relative"
      title={`Current theme: ${theme}`}
    >
      <div className="relative w-6 h-6">
        <AnimatePresence mode="wait">
          {theme === 'dark' && (
            <motion.div
              key="dark"
              initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Moon className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />
            </motion.div>
          )}
          {theme === 'light' && (
            <motion.div
              key="light"
              initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Sun className="w-5 h-5 text-orange-500 fill-orange-500/20" />
            </motion.div>
          )}
          {theme === 'system' && (
            <motion.div
              key="system"
              initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Monitor className="w-5 h-5 text-blue-400 fill-blue-400/20" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Label for current mode - optional tooltip style */}
      <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none">
        {theme} mode
      </span>
    </button>
  );
}
