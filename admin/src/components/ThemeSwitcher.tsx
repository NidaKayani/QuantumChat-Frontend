import { useEffect, useRef, useState } from 'react';
import { THEME_OPTIONS } from '../theme';
import { useTheme } from '../context/ThemeContext';

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = THEME_OPTIONS.find((t) => t.id === theme)!;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`qc-theme-btn ${compact ? 'qc-theme-btn-compact' : ''}`}
        title="Change theme"
      >
        <span className="text-base leading-none">{current.icon}</span>
        {!compact && <span className="text-sm font-medium">{current.label}</span>}
        <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="qc-theme-menu">
          <p className="qc-theme-menu-label">Appearance</p>
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => { setTheme(opt.id); setOpen(false); }}
              className={`qc-theme-option ${theme === opt.id ? 'qc-theme-option-active' : ''}`}
            >
              <span className="text-lg">{opt.icon}</span>
              <div className="text-left">
                <p className="text-sm font-semibold">{opt.label}</p>
                <p className="text-xs opacity-70">{opt.description}</p>
              </div>
              {theme === opt.id && (
                <svg className="w-4 h-4 ml-auto text-qc-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
