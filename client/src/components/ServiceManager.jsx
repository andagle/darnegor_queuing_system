import { useState } from "react";
import { useQueue } from "../context/QueueContext.jsx";

export default function ServiceManager() {
  const { services, addService, updateService, deleteService } = useQueue();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setBusy(true);
    setError("");
    try {
      await addService(newName.trim());
      setNewName("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function startEdit(s) {
    setEditingId(s.id);
    setEditingName(s.name);
    setError("");
  }

  async function saveEdit(id) {
    if (!editingName.trim()) return;
    setBusy(true);
    setError("");
    try {
      await updateService(id, editingName.trim());
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id) {
    setBusy(true);
    setError("");
    try {
      await deleteService(id);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-light/60 dark:text-ink-dark/60">
        These are the services clients can choose from when they select a
        number. Changes apply immediately.
      </p>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {error}
        </p>
      )}

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add a new service, e.g. Land Title Processing"
          className="flex-1 rounded-lg border border-surface-light-3 dark:border-surface-dark-3 bg-surface-light-2 dark:bg-surface-dark-3 px-3 py-2 text-sm outline-none focus:border-neon-400"
        />
        <button
          disabled={busy || !newName.trim()}
          className="rounded-lg bg-neon-400 px-4 py-2 text-sm font-semibold text-surface-dark hover:bg-neon-500 disabled:opacity-40 transition-colors"
        >
          Add
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {services.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-surface-light-3 dark:border-surface-dark-3 bg-surface-light-2 dark:bg-surface-dark-2 px-4 py-2.5"
          >
            {editingId === s.id ? (
              <input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && saveEdit(s.id)}
                className="flex-1 rounded-md border border-neon-400 bg-transparent px-2 py-1 text-sm outline-none"
              />
            ) : (
              <span className="text-sm">{s.name}</span>
            )}

            <div className="flex shrink-0 gap-2">
              {editingId === s.id ? (
                <button
                  onClick={() => saveEdit(s.id)}
                  disabled={busy}
                  className="rounded-full bg-neon-400 px-3 py-1 text-xs font-semibold text-surface-dark disabled:opacity-40"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => startEdit(s)}
                  className="rounded-full border border-surface-light-3 dark:border-surface-dark-3 px-3 py-1 text-xs font-medium hover:border-neon-400 hover:text-neon-600 dark:hover:text-neon-400"
                >
                  Rename
                </button>
              )}
              <button
                onClick={() => handleDelete(s.id)}
                disabled={busy}
                className="rounded-full border border-red-400/50 px-3 py-1 text-xs font-medium text-red-500 hover:bg-red-500/10 disabled:opacity-40"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {services.length === 0 && (
          <p className="text-sm text-ink-light/50 dark:text-ink-dark/50">
            No services yet. Add one above.
          </p>
        )}
      </div>
    </div>
  );
}
