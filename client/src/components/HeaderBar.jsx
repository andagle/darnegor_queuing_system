import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.jsx";
import { useQueue } from "../context/QueueContext.jsx";

export default function HeaderBar({ subtitle, backTo = "/", backLabel = "Home" }) {
  const { connected } = useQueue();

  return (
    <header className="flex items-center justify-between border-b border-surface-light-3 dark:border-surface-dark-3 px-5 py-4 sm:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-light dark:bg-neon-400 text-neon-400 dark:text-surface-dark font-display font-bold shadow-neon">
          DAR
        </div>
        <div className="leading-tight">
          <p className="font-display text-sm font-semibold tracking-wide">
            DAR Negros Oriental
          </p>
          <p className="text-xs text-ink-light/60 dark:text-ink-dark/60">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`hidden items-center gap-1.5 text-xs sm:flex ${
            connected ? "text-neon-600 dark:text-neon-400" : "text-ink-light/40 dark:text-ink-dark/40"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              connected ? "bg-neon-400 animate-pulseGlow" : "bg-gray-400"
            }`}
          />
          {connected ? "Live" : "Connecting…"}
        </span>
        <Link
          to={backTo}
          className="rounded-full border border-surface-light-3 dark:border-surface-dark-3 px-3 py-2 text-xs font-medium hover:border-neon-400 hover:text-neon-600 dark:hover:text-neon-400 transition-colors"
        >
          {backLabel}
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
