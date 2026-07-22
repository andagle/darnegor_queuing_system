import { useTheme } from "../context/ThemeContext.jsx";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`inline-flex items-center gap-2 rounded-full border border-surface-light-3 dark:border-surface-dark-3 bg-surface-light-2 dark:bg-surface-dark-2 px-3 py-2 text-xs font-medium text-ink-light dark:text-ink-dark hover:border-neon-400 hover:text-neon-600 dark:hover:text-neon-400 transition-colors ${className}`}
    >
      <span className="text-base leading-none">{isDark ? "🌙" : "☀️"}</span>
      <span className="hidden sm:inline">{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}
