import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const QueueContext = createContext(null);

const initialState = {
  config: { minNumber: 1, maxNumber: 20 },
  services: [],
  tickets: [],
  callLog: [],
};

async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    /* no body */
  }
  if (!res.ok) {
    throw new Error(body?.error || "Something went wrong. Please try again.");
  }
  return body;
}

export function QueueProvider({ children }) {
  const [state, setState] = useState(initialState);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io({ path: "/socket.io" });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("state", (payload) => setState(payload));

    // Also fetch once immediately in case the socket takes a moment.
    request("/state").then(setState).catch(() => {});

    return () => socket.disconnect();
  }, []);

  const value = {
    ...state,
    connected,
    socket: socketRef.current,

    availableNumbers: (() => {
      const taken = new Set(state.tickets.map((t) => t.number));
      const out = [];
      for (let n = state.config.minNumber; n <= state.config.maxNumber; n++) {
        if (!taken.has(n)) out.push(n);
      }
      return out;
    })(),

    createTicket: (number, serviceId) =>
      request("/tickets", {
        method: "POST",
        body: JSON.stringify({ number, serviceId }),
      }),

    callNext: () => request("/tickets/call-next", { method: "POST" }),
    serveNumber: (number) =>
      request(`/tickets/${number}/serve`, { method: "POST" }),
    recallNumber: (number) =>
      request(`/tickets/${number}/recall`, { method: "POST" }),
    completeNumber: (number) =>
      request(`/tickets/${number}/complete`, { method: "POST" }),

    addService: (name) =>
      request("/services", { method: "POST", body: JSON.stringify({ name }) }),
    updateService: (id, name) =>
      request(`/services/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name }),
      }),
    deleteService: (id) => request(`/services/${id}`, { method: "DELETE" }),

    updateConfig: (minNumber, maxNumber) =>
      request("/config", {
        method: "PUT",
        body: JSON.stringify({ minNumber, maxNumber }),
      }),
  };

  return (
    <QueueContext.Provider value={value}>{children}</QueueContext.Provider>
  );
}

export function useQueue() {
  return useContext(QueueContext);
}
