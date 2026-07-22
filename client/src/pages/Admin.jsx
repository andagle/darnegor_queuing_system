import { useState } from "react";
import HeaderBar from "../components/HeaderBar.jsx";
import AdminQueuePanel from "../components/AdminQueuePanel.jsx";
import ServiceManager from "../components/ServiceManager.jsx";
import RangeSettings from "../components/RangeSettings.jsx";

const TABS = [
  { id: "queue", label: "Queue" },
  { id: "services", label: "Services" },
  { id: "settings", label: "Queue Range" },
];

export default function Admin() {
  const [tab, setTab] = useState("queue");

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      <HeaderBar subtitle="Admin · Queue management" />

      <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-neon-600 dark:text-neon-400">
              Staff Dashboard
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold">
              Manage today's queue
            </h1>
          </div>
          <a
            href="/waiting"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-surface-light-3 dark:border-surface-dark-3 px-4 py-2 text-xs font-medium hover:border-neon-400 hover:text-neon-600 dark:hover:text-neon-400 transition-colors"
          >
            Open lobby display ↗
          </a>
        </div>

        <div className="mb-6 flex gap-2 border-b border-surface-light-3 dark:border-surface-dark-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "text-neon-700 dark:text-neon-400"
                  : "text-ink-light/50 dark:text-ink-dark/50 hover:text-ink-light dark:hover:text-ink-dark"
              }`}
            >
              {t.label}
              {tab === t.id && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-neon-400" />
              )}
            </button>
          ))}
        </div>

        {tab === "queue" && <AdminQueuePanel />}
        {tab === "services" && <ServiceManager />}
        {tab === "settings" && <RangeSettings />}
      </main>
    </div>
  );
}
