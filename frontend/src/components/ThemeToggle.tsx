/**
 * Theme Toggle Component
 * Switch between dark, light, and system themes
 */
import { useThemeStore, type Theme } from '../store/useThemeStore';

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const themes: { value: Theme; icon: string; label: string }[] = [
    { value: 'light', icon: '☀️', label: 'Light' },
    { value: 'dark', icon: '🌙', label: 'Dark' },
    { value: 'system', icon: '💻', label: 'System' },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-white/10 rounded-lg">
      {themes.map((t) => (
        <button
          key={t.value}
          type="button"
          title={t.label}
          onClick={() => setTheme(t.value)}
          className={`px-2 py-1 text-sm rounded transition-colors ${
            theme === t.value
              ? 'bg-cyan-500 text-white'
              : 'text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          {t.icon}
        </button>
      ))}
    </div>
  );
}
