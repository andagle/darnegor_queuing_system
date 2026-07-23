import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL;

const QueueContext = createContext(null);

const initialState = {
  config: {
    minNumber: 1,
    maxNumber: 20,
  },
  services: [],
  tickets: [],
  callLog: [],
};

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}/api${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  let body = null;

  try {
    body = await res.json();
  } catch (err) {
    // ignore empty responses
  }

  if (!res.ok) {
    throw new Error(body?.error || "Request failed.");
  }

  return body;
}

export function QueueProvider({ children }) {
  const [state, setState] = useState(initialState);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Fetch initial state
    request("/state")
      .then((data) => {
        if (data && Array.isArray(data.tickets)) {
          setState(data);
        }
      })
      .catch((err) => {
        console.error("Failed to load state:", err);
      });

    // Socket connection
    const socket = io(API_URL, {
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected");
      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setConnected(false);
    });

    socket.on("state", (payload) => {
      console.log("Received state:", payload);

      if (
        payload &&
        typeof payload === "object" &&
        Array.isArray(payload.tickets)
      ) {
        setState(payload);
      }
    });

    socket.on("connect_error", (err) => {
      console.error("Socket error:", err.message);
    });

    return () => socket.disconnect();
  }, []);

  const tickets = state?.tickets ?? [];
  const services = state?.services ?? [];
  const callLog = state?.callLog ?? [];
  const config = state?.config ?? initialState.config;

  const availableNumbers = (() => {
    const taken = new Set(tickets.map((t) => t.number));

    const out = [];

    for (let n = config.minNumber; n <= config.maxNumber; n++) {
      if (!taken.has(n)) out.push(n);
    }

    return out;
  })();

  const value = {
    config,
    services,
    tickets,
    callLog,
    availableNumbers,
    connected,
    socket: socketRef.current,

    createTicket: (number, serviceId) =>
      request("/tickets", {
        method: "POST",
        body: JSON.stringify({ number, serviceId }),
      }),

    callNext: () =>
      request("/tickets/call-next", {
        method: "POST",
      }),

    serveNumber: (number) =>
      request(`/tickets/${number}/serve`, {
        method: "POST",
      }),

    recallNumber: (number) =>
      request(`/tickets/${number}/recall`, {
        method: "POST",
      }),

    completeNumber: (number) =>
      request(`/tickets/${number}/complete`, {
        method: "POST",
      }),

    addService: (name) =>
      request("/services", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),

    updateService: (id, name) =>
      request(`/services/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name }),
      }),

    deleteService: (id) =>
      request(`/services/${id}`, {
        method: "DELETE",
      }),

    updateConfig: (minNumber, maxNumber) =>
      request("/config", {
        method: "PUT",
        body: JSON.stringify({
          minNumber,
          maxNumber,
        }),
      }),
  };

  return (
    <QueueContext.Provider value={value}>
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  return useContext(QueueContext);
}