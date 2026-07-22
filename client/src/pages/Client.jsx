import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderBar from "../components/HeaderBar.jsx";
import NumberGrid from "../components/NumberGrid.jsx";
import ServiceModal from "../components/ServiceModal.jsx";
import { useQueue } from "../context/QueueContext.jsx";

export default function Client() {
  const { config, services, availableNumbers, createTicket } = useQueue();
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const availableSet = new Set(availableNumbers);

  function handleSelect(n) {
    setError("");
    setSelected(n);
  }

  async function handleConfirm(serviceId) {
    if (!selected) return;
    setSubmitting(true);
    setError("");
    try {
      await createTicket(selected, serviceId);
      navigate(`/waiting?ticket=${selected}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      <HeaderBar subtitle="Client · Take a number" />

      <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <div className="mb-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-neon-600 dark:text-neon-400">
            Step 1 of 2
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
            Choose your queue number
          </h1>
          <p className="mt-2 text-sm text-ink-light/60 dark:text-ink-dark/60">
            Numbers {config.minNumber}–{config.maxNumber}. Greyed-out numbers
            are already in use.
          </p>
        </div>

        <NumberGrid
          min={config.minNumber}
          max={config.maxNumber}
          availableSet={availableSet}
          selected={selected}
          onSelect={handleSelect}
        />

        {availableNumbers.length === 0 && (
          <p className="mt-8 text-center text-sm text-ink-light/60 dark:text-ink-dark/60">
            All numbers are currently taken. Please wait for a slot to free up.
          </p>
        )}
      </main>

      {selected && (
        <ServiceModal
          number={selected}
          services={services}
          submitting={submitting}
          error={error}
          onConfirm={handleConfirm}
          onClose={() => {
            if (!submitting) {
              setSelected(null);
              setError("");
            }
          }}
        />
      )}
    </div>
  );
}
