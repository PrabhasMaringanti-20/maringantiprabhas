'use client';

import { useEffect, useState } from 'react';
import Icon from './Icon';

type Theme = 'light' | 'dark';

function currentTheme(): Theme {
  const pinned = document.documentElement.getAttribute('data-theme');
  if (pinned === 'dark' || pinned === 'light') return pinned;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function ThemeToggle({ className = '' }: { className?: string }) {
  // Rendered light-first on the server; corrected on mount so the markup the
  // server sends is always stable.
  const [theme, setTheme] = useState<Theme>('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTheme(currentTheme());
    setReady(true);
  }, []);

  function toggle() {
    const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* private mode — the choice just won't persist */
    }
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={`grid h-10 w-10 flex-none place-items-center rounded-full border border-line-2 bg-card text-ink-2 transition-colors hover:text-ink ${className}`}
    >
      {/* invisible until mounted so we never flash the wrong glyph */}
      <span className={ready ? 'opacity-100' : 'opacity-0'}>
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="h-[17px] w-[17px]" />
      </span>
    </button>
  );
}
