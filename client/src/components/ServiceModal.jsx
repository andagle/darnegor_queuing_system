export default function ServiceModal({
  number,
  services,
  onConfirm,
  onClose,
  submitting,
  error,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-modal-title"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-surface-light-3 dark:border-surface-dark-3 bg-surface-light dark:bg-surface-dark-2 p-6 shadow-neon-lg"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-neon-600 dark:text-neon-400">
              Number {String(number).padStart(2, "0")}
            </p>
            <h2 id="service-modal-title" className="font-display text-lg font-semibold">
              What do you need today?
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-ink-light/50 dark:text-ink-dark/50 hover:bg-surface-light-3 dark:hover:bg-surface-dark-3"
          >
            ✕
          </button>
        </div>

        {services.length === 0 ? (
          <p className="text-sm text-ink-light/60 dark:text-ink-dark/60">
            No services are configured yet. Please check with the staff at the counter.
          </p>
        ) : (
          <div className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
            {services.map((s) => (
              <button
                key={s.id}
                disabled={submitting}
                onClick={() => onConfirm(s.id)}
                className="rounded-xl border border-surface-light-3 dark:border-surface-dark-3 bg-surface-light-2 dark:bg-surface-dark-3 px-4 py-3 text-left text-sm font-medium hover:border-neon-400 hover:text-neon-600 dark:hover:text-neon-400 disabled:opacity-50 transition-colors"
              >
                {s.name}
              </button>
            ))}
          </div>
        )}

        {error && (
          <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
