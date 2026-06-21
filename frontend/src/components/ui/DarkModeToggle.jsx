import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

/**
 * DarkModeToggle Component
 * Persists preference in localStorage.
 * Add `darkMode: 'class'` to your tailwind.config.js to enable.
 */
export default function DarkModeToggle() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark((prev) => !prev)}
      className="p-2 rounded-full border border-eco-border text-eco-muted hover:text-eco-primary hover:bg-eco-bg transition-colors"
      aria-label="Toggle dark mode"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
