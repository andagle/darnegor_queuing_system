import { useEffect, useState } from "react";
import { useQueue } from "../context/QueueContext.jsx";

export default function RangeSettings() {
  const { config, updateConfig } = useQueue();
  const [min, setMin] = useState(config.minNumber);
  const [max, setMax] = useState(config.maxNumber);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMin(config.minNumber);
    setMax(config.maxNumber);
  }, [config.minNumber, config.maxNumber]);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      await updateConfig(Number(min), Number(max));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-light/60 dark:text-ink-dark/60">
        Set the range of numbers clients can choose from. The default is 1–20.
      </p>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {error}
        </p>
      )}
      {saved && (
        <p className="rounded-lg bg-neon-50 dark:bg-neon-700/10 px-3 py-2 text-sm text-neon-700 dark:text-neon-400">
          Queue range updated.
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-xs font-medium text-ink-light/60 dark:text-ink-dark/60">
          Minimum number
          <input
            type="number"
            min={1}
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="w-28 rounded-lg border border-surface-light-3 dark:border-surface-dark-3 bg-surface-light-2 dark:bg-surface-dark-3 px-3 py-2 text-sm outline-none focus:border-neon-400"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-ink-light/60 dark:text-ink-dark/60">
          Maximum number
          <input
            type="number"
            min={1}
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="w-28 rounded-lg border border-surface-light-3 dark:border-surface-dark-3 bg-surface-light-2 dark:bg-surface-dark-3 px-3 py-2 text-sm outline-none focus:border-neon-400"
          />
        </label>
        <button
          disabled={busy}
          className="rounded-lg bg-neon-400 px-4 py-2 text-sm font-semibold text-surface-dark hover:bg-neon-500 disabled:opacity-40 transition-colors"
        >
          {busy ? "Saving…" : "Save range"}
        </button>
      </form>
      <p className="text-xs text-ink-light/40 dark:text-ink-dark/40">
        Currently: {config.minNumber}–{config.maxNumber} ({config.maxNumber - config.minNumber + 1} numbers)
      </p>
    </div>
  );
}
