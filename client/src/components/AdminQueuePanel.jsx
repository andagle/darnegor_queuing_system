import { useState } from "react";
import { useQueue } from "../context/QueueContext.jsx";

export default function AdminQueuePanel() {
  const { tickets, callNext, serveNumber, recallNumber, completeNumber } =
    useQueue();
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");

  const waiting = tickets
    .filter((t) => t.status === "waiting")
    .sort((a, b) => a.createdAt - b.createdAt);
  const serving = tickets
    .filter((t) => t.status === "serving")
    .sort((a, b) => (b.calledAt || 0) - (a.calledAt || 0));

  async function run(number, fn) {
    setBusy(number);
    setError("");
    try {
      await fn(number);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  }

  async function handleCallNext() {
    setBusy("call-next");
    setError("");
    try {
      await callNext();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-surface-light-3 dark:border-surface-dark-3 bg-surface-light-2 dark:bg-surface-dark-2 p-4">
        <div>
          <p className="font-display text-sm font-semibold">
            {waiting.length} waiting · {serving.length} being served
          </p>
          <p className="text-xs text-ink-light/50 dark:text-ink-dark/50">
            Calling next takes the person who has waited the longest.
          </p>
        </div>
        <button
          onClick={handleCallNext}
          disabled={busy !== null || waiting.length === 0}
          className="rounded-full bg-neon-400 px-5 py-2.5 text-sm font-semibold text-surface-dark hover:bg-neon-500 disabled:opacity-40 disabled:hover:bg-neon-400 transition-colors shadow-neon"
        >
          {busy === "call-next" ? "Calling…" : "Call next number"}
        </button>
      </div>

      <section>
        <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-ink-light/60 dark:text-ink-dark/60">
          Being served
        </h3>
        <div className="flex flex-col gap-2">
          {serving.length === 0 && (
            <p className="text-sm text-ink-light/50 dark:text-ink-dark/50">
              No one is currently being served.
            </p>
          )}
          {serving.map((t) => (
            <div
              key={t.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neon-400/50 bg-neon-50 dark:bg-neon-700/10 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-lg font-bold">
                  #{String(t.number).padStart(2, "0")}
                </span>
                <span className="text-sm text-ink-light/70 dark:text-ink-dark/70">
                  {t.service.name}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  disabled={busy === t.number}
                  onClick={() => run(t.number, recallNumber)}
                  className="rounded-full border border-surface-light-3 dark:border-surface-dark-3 px-3 py-1.5 text-xs font-medium hover:border-neon-400 hover:text-neon-600 dark:hover:text-neon-400 disabled:opacity-40 transition-colors"
                >
                  Announce again
                </button>
                <button
                  disabled={busy === t.number}
                  onClick={() => run(t.number, completeNumber)}
                  className="rounded-full bg-ink-light dark:bg-neon-400 px-3 py-1.5 text-xs font-semibold text-white dark:text-surface-dark hover:opacity-90 disabled:opacity-40 transition-opacity"
                >
                  {busy === t.number ? "Completing…" : "Complete transaction"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-ink-light/60 dark:text-ink-dark/60">
          Waiting list
        </h3>
        <div className="flex flex-col gap-2">
          {waiting.length === 0 && (
            <p className="text-sm text-ink-light/50 dark:text-ink-dark/50">
              The queue is empty.
            </p>
          )}
          {waiting.map((t, i) => (
            <div
              key={t.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-surface-light-3 dark:border-surface-dark-3 bg-surface-light-2 dark:bg-surface-dark-2 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-ink-light/40 dark:text-ink-dark/40">
                  {i + 1}
                </span>
                <span className="font-mono text-lg font-bold">
                  #{String(t.number).padStart(2, "0")}
                </span>
                <span className="text-sm text-ink-light/70 dark:text-ink-dark/70">
                  {t.service.name}
                </span>
              </div>
              <button
                disabled={busy === t.number}
                onClick={() => run(t.number, serveNumber)}
                className="rounded-full border border-neon-400/60 px-3 py-1.5 text-xs font-semibold text-neon-700 dark:text-neon-400 hover:bg-neon-50 dark:hover:bg-neon-700/10 disabled:opacity-40 transition-colors"
              >
                {busy === t.number ? "Calling…" : "Call this number"}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
