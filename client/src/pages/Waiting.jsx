import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import HeaderBar from "../components/HeaderBar.jsx";
import { useQueue } from "../context/QueueContext.jsx";

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

export default function Waiting() {
  const { tickets, callLog, socket } = useQueue();
  const [searchParams] = useSearchParams();
  const myTicket = Number(searchParams.get("ticket")) || null;
  const [soundOn, setSoundOn] = useState(false);
  const [flash, setFlash] = useState(false);
  const soundOnRef = useRef(soundOn);
  soundOnRef.current = soundOn;

  const serving = tickets
    .filter((t) => t.status === "serving")
    .sort((a, b) => (b.calledAt || 0) - (a.calledAt || 0));
  const nowServing = serving[0] || null;

  const waiting = tickets
    .filter((t) => t.status === "waiting")
    .sort((a, b) => a.createdAt - b.createdAt);

  const myWaitingPosition = myTicket
    ? waiting.findIndex((t) => t.number === myTicket) + 1
    : 0;
  const isMyTurn = nowServing && nowServing.number === myTicket;

  useEffect(() => {
    if (!socket) return;
    const handler = ({ number, service }) => {
      setFlash(true);
      setTimeout(() => setFlash(false), 2500);
      if (soundOnRef.current) {
        speak(`Number ${number}. Please proceed to the counter for ${service}.`);
      }
    };
    socket.on("announce", handler);
    return () => socket.off("announce", handler);
  }, [socket]);

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      <HeaderBar subtitle="Waiting Dashboard · Lobby display" />

      <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        {!soundOn && (
          <button
            onClick={() => {
              speak("Voice announcements enabled.");
              setSoundOn(true);
            }}
            className="mb-6 w-full rounded-xl border border-neon-400/60 bg-neon-50 dark:bg-neon-700/10 px-4 py-3 text-sm font-medium text-neon-700 dark:text-neon-400 hover:shadow-neon transition-all"
          >
            🔊 Tap to enable voice announcements on this screen
          </button>
        )}

        {myTicket && (
          <div
            className={`mb-6 rounded-xl border px-5 py-4 text-center transition-all ${
              isMyTurn
                ? "border-neon-400 bg-neon-50 dark:bg-neon-700/20 shadow-neon-lg"
                : "border-surface-light-3 dark:border-surface-dark-3 bg-surface-light-2 dark:bg-surface-dark-2"
            }`}
          >
            {isMyTurn ? (
              <p className="font-display text-lg font-semibold text-neon-700 dark:text-neon-400">
                It's your turn! Please proceed to the counter now.
              </p>
            ) : (
              <p className="text-sm">
                Your ticket is{" "}
                <span className="font-mono font-bold">
                  #{String(myTicket).padStart(2, "0")}
                </span>
                {myWaitingPosition > 0 && (
                  <>
                    {" "}
                    — position{" "}
                    <span className="font-mono font-bold">
                      {myWaitingPosition}
                    </span>{" "}
                    in line
                  </>
                )}
                . We'll announce it here when it's ready.
              </p>
            )}
          </div>
        )}

        {/* Now serving - departure board style */}
        <section className="mb-10 rounded-3xl border border-surface-light-3 dark:border-surface-dark-3 bg-ink-light dark:bg-surface-dark-2 px-6 py-10 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-neon-400">
            Now Serving
          </p>
          <div
            className={`mx-auto mt-4 inline-block rounded-2xl px-10 py-6 font-mono text-7xl font-bold text-neon-400 sm:text-8xl ${
              flash ? "animate-pulseGlow" : ""
            }`}
            style={{ textShadow: "0 0 30px rgba(33,242,122,0.6)" }}
          >
            {nowServing ? String(nowServing.number).padStart(2, "0") : "--"}
          </div>
          <p className="mt-3 text-sm text-neon-100/70">
            {nowServing ? nowServing.service.name : "Waiting for the next call"}
          </p>
        </section>

        <div className="grid gap-6 sm:grid-cols-2">
          <section>
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-ink-light/60 dark:text-ink-dark/60">
              Waiting list ({waiting.length})
            </h2>
            <div className="flex flex-col gap-2">
              {waiting.length === 0 && (
                <p className="text-sm text-ink-light/50 dark:text-ink-dark/50">
                  No one is waiting right now.
                </p>
              )}
              {waiting.map((t, i) => (
                <div
                  key={t.id}
                  className={`flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm ${
                    t.number === myTicket
                      ? "border-neon-400 bg-neon-50 dark:bg-neon-700/10"
                      : "border-surface-light-3 dark:border-surface-dark-3 bg-surface-light-2 dark:bg-surface-dark-2"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="font-mono font-bold">
                      #{String(t.number).padStart(2, "0")}
                    </span>
                    <span className="text-ink-light/60 dark:text-ink-dark/60">
                      {t.service.name}
                    </span>
                  </span>
                  <span className="font-mono text-xs text-ink-light/40 dark:text-ink-dark/40">
                    {i === 0 ? "Next" : `#${i + 1} in line`}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-ink-light/60 dark:text-ink-dark/60">
              Recently called
            </h2>
            <div className="flex flex-col gap-2">
              {callLog.length === 0 && (
                <p className="text-sm text-ink-light/50 dark:text-ink-dark/50">
                  No calls yet.
                </p>
              )}
              {callLog.map((c, i) => (
                <div
                  key={`${c.number}-${c.calledAt}-${i}`}
                  className="flex items-center justify-between rounded-lg border border-surface-light-3 dark:border-surface-dark-3 bg-surface-light-2 dark:bg-surface-dark-2 px-4 py-2.5 text-sm"
                >
                  <span className="flex items-center gap-3">
                    <span className="font-mono font-bold">
                      #{String(c.number).padStart(2, "0")}
                    </span>
                    <span className="text-ink-light/60 dark:text-ink-dark/60">
                      {c.service}
                    </span>
                  </span>
                  <span className="text-xs text-ink-light/40 dark:text-ink-dark/40">
                    {new Date(c.calledAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/client"
            className="text-xs text-ink-light/50 dark:text-ink-dark/50 underline decoration-dotted underline-offset-4 hover:text-neon-600 dark:hover:text-neon-400"
          >
            ← Back to number selection
          </Link>
        </div>
      </main>
    </div>
  );
}
