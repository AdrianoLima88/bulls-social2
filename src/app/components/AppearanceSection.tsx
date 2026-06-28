import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

// ─── Full settings section ──────────────────────────────────
export const AppearanceSection: React.FC = () => {
  const { theme, isDark, setTheme } = useTheme();

  const options: { value: 'light' | 'dark' | 'system'; label: string; icon: typeof Sun; desc: string }[] = [
    { value: 'light',  label: 'Light',  icon: Sun,     desc: 'Always use light theme' },
    { value: 'dark',   label: 'Dark',   icon: Moon,    desc: 'Always use dark theme' },
    { value: 'system', label: 'System', icon: Monitor, desc: 'Follow device preference' },
  ];

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
        Theme
      </p>
      {options.map(opt => {
        const Icon = opt.icon;
        const isSelected = theme === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border-2 transition ${
              isSelected
                ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isSelected ? 'bg-green-600' : 'bg-slate-100 dark:bg-slate-700'
            }`}>
              <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`} />
            </div>
            <div className="flex-1 text-left">
              <p className={`font-semibold text-sm ${isSelected ? 'text-green-700 dark:text-green-400' : 'text-slate-800 dark:text-slate-200'}`}>
                {opt.label}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{opt.desc}</p>
            </div>
            {isSelected && (
              <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

// ─── Compact toggle for header/quick access ────────────────
export const DarkModeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className={`w-10 h-10 rounded-full flex items-center justify-center transition hover:bg-slate-100 dark:hover:bg-slate-700 ${className}`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark
        ? <Sun className="w-5 h-5 text-yellow-400" />
        : <Moon className="w-5 h-5 text-slate-600" />
      }
    </button>
  );
};
