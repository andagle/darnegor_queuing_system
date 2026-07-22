import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-light dark:bg-surface-dark">
      <div className="flex justify-end p-5 sm:p-8">
        <ThemeToggle />
      </div>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-16 -mt-10">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-light dark:bg-neon-400 font-display text-xl font-bold text-neon-400 dark:text-surface-dark shadow-neon-lg">
            DAR
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-neon-600 dark:text-neon-400">
            Negros Oriental Provincial Office
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
            Queuing System
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-ink-light/60 dark:text-ink-dark/60">
            Take a number, choose your transaction, and we'll call you when
            it's your turn. Who's using the system right now?
          </p>
        </div>

        <div className="grid w-full max-w-2xl grid-cols-1 gap-5 sm:grid-cols-2">
          <Link
            to="/client"
            className="group relative overflow-hidden rounded-2xl border border-surface-light-3 dark:border-surface-dark-3 bg-surface-light-2 dark:bg-surface-dark-2 p-8 text-left transition-all hover:border-neon-400 hover:shadow-neon"
          >
            <span className="font-mono text-xs uppercase tracking-widest text-neon-600 dark:text-neon-400">
              Get a number
            </span>
            <h2 className="mt-3 font-display text-2xl font-semibold">
              I'm a Client
            </h2>
            <p className="mt-2 text-sm text-ink-light/60 dark:text-ink-dark/60">
              Pick an available queue number and select the service you need.
            </p>
            <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-neon-600 dark:text-neon-400">
              Continue
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </span>
          </Link>

          <Link
            to="/admin"
            className="group relative overflow-hidden rounded-2xl border border-surface-light-3 dark:border-surface-dark-3 bg-surface-light-2 dark:bg-surface-dark-2 p-8 text-left transition-all hover:border-neon-400 hover:shadow-neon"
          >
            <span className="font-mono text-xs uppercase tracking-widest text-neon-600 dark:text-neon-400">
              Manage the queue
            </span>
            <h2 className="mt-3 font-display text-2xl font-semibold">
              I'm Staff
            </h2>
            <p className="mt-2 text-sm text-ink-light/60 dark:text-ink-dark/60">
              Call numbers, manage services, and configure the queue range.
            </p>
            <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-neon-600 dark:text-neon-400">
              Open dashboard
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </span>
          </Link>
        </div>

        <Link
          to="/waiting"
          className="mt-8 text-xs text-ink-light/50 dark:text-ink-dark/50 underline decoration-dotted underline-offset-4 hover:text-neon-600 dark:hover:text-neon-400"
        >
          Open the lobby waiting dashboard
        </Link>
      </main>
    </div>
  );
}
