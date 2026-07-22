export default function NumberGrid({ min, max, availableSet, onSelect, selected }) {
  const numbers = [];
  for (let n = min; n <= max; n++) numbers.push(n);

  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
      {numbers.map((n) => {
        const isAvailable = availableSet.has(n);
        const isSelected = selected === n;
        return (
          <button
            key={n}
            disabled={!isAvailable}
            onClick={() => onSelect(n)}
            aria-pressed={isSelected}
            aria-label={
              isAvailable ? `Select number ${n}` : `Number ${n}, already taken`
            }
            className={[
              "ticket-stub relative flex aspect-[4/5] flex-col items-center justify-center rounded-xl border font-mono text-xl font-bold transition-all",
              isAvailable
                ? "border-surface-light-3 dark:border-surface-dark-3 bg-surface-light-2 dark:bg-surface-dark-2 hover:border-neon-400 hover:shadow-neon hover:-translate-y-0.5 cursor-pointer text-ink-light dark:text-ink-dark"
                : "cursor-not-allowed border-transparent bg-surface-light-3/60 dark:bg-surface-dark-3/60 text-ink-light/30 dark:text-ink-dark/25 line-through",
              isSelected ? "border-neon-400 shadow-neon-lg bg-neon-50 dark:bg-neon-700/20" : "",
            ].join(" ")}
          >
            <span>{String(n).padStart(2, "0")}</span>
            <span className="mt-1 text-[9px] font-body font-normal uppercase tracking-wider text-ink-light/40 dark:text-ink-dark/40">
              {isAvailable ? "Available" : "Taken"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
