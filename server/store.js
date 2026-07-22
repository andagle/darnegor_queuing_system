// In-memory store. No database — the whole app state lives here in server
// memory and is broadcast to every connected browser over Socket.IO, so all
// screens (client, admin, waiting dashboard) always see the same live queue.
// State resets if the server process restarts.

const { randomUUID } = require("crypto");

let state = {
  config: {
    minNumber: 1,
    maxNumber: 20,
  },
  services: [
    { id: randomUUID(), name: "Land Distribution Inquiry" },
    { id: randomUUID(), name: "Land Title Processing" },
    { id: randomUUID(), name: "Beneficiary Records Request" },
    { id: randomUUID(), name: "Complaint / Grievance Filing" },
    { id: randomUUID(), name: "General Assistance" },
  ],
  tickets: [],
  // Rolling log of numbers that have been called, most recent first.
  // Used by the waiting dashboard to show recently-served history.
  callLog: [],
};

function publicState() {
  return {
    config: state.config,
    services: state.services,
    tickets: state.tickets,
    callLog: state.callLog.slice(0, 8),
  };
}

function getAvailableNumbers() {
  const taken = new Set(state.tickets.map((t) => t.number));
  const numbers = [];
  for (let n = state.config.minNumber; n <= state.config.maxNumber; n++) {
    if (!taken.has(n)) numbers.push(n);
  }
  return numbers;
}

function createTicket({ number, serviceId }) {
  number = Number(number);
  if (!Number.isInteger(number)) {
    throw new Error("Ticket number must be an integer.");
  }
  if (number < state.config.minNumber || number > state.config.maxNumber) {
    throw new Error("That number is outside the current queue range.");
  }
  if (state.tickets.some((t) => t.number === number)) {
    throw new Error("That number has already been taken.");
  }
  const service = state.services.find((s) => s.id === serviceId);
  if (!service) {
    throw new Error("That service is no longer available. Please choose again.");
  }

  const ticket = {
    id: randomUUID(),
    number,
    service,
    status: "waiting", // waiting -> serving -> done (removed)
    createdAt: Date.now(),
    calledAt: null,
  };
  state.tickets.push(ticket);
  return ticket;
}

function findTicketByNumber(number) {
  number = Number(number);
  return state.tickets.find((t) => t.number === number);
}

function callNextTicket() {
  const next = state.tickets
    .filter((t) => t.status === "waiting")
    .sort((a, b) => a.createdAt - b.createdAt)[0];
  if (!next) return null;
  return serveTicket(next.number);
}

function serveTicket(number) {
  const ticket = findTicketByNumber(number);
  if (!ticket) throw new Error("Ticket not found.");
  ticket.status = "serving";
  ticket.calledAt = Date.now();
  state.callLog.unshift({
    number: ticket.number,
    service: ticket.service.name,
    calledAt: ticket.calledAt,
  });
  state.callLog = state.callLog.slice(0, 20);
  return ticket;
}

function completeTicket(number) {
  const ticket = findTicketByNumber(number);
  if (!ticket) throw new Error("Ticket not found.");
  state.tickets = state.tickets.filter((t) => t.number !== Number(number));
  return ticket;
}

function recallTicket(number) {
  // Re-announce an already-serving ticket without changing its place in line.
  const ticket = findTicketByNumber(number);
  if (!ticket) throw new Error("Ticket not found.");
  ticket.calledAt = Date.now();
  state.callLog.unshift({
    number: ticket.number,
    service: ticket.service.name,
    calledAt: ticket.calledAt,
  });
  state.callLog = state.callLog.slice(0, 20);
  return ticket;
}

function addService(name) {
  name = String(name || "").trim();
  if (!name) throw new Error("Service name cannot be empty.");
  const service = { id: randomUUID(), name };
  state.services.push(service);
  return service;
}

function updateService(id, name) {
  name = String(name || "").trim();
  if (!name) throw new Error("Service name cannot be empty.");
  const service = state.services.find((s) => s.id === id);
  if (!service) throw new Error("Service not found.");
  service.name = name;
  // Keep any existing tickets' embedded service name in sync.
  state.tickets.forEach((t) => {
    if (t.service.id === id) t.service = { ...t.service, name };
  });
  return service;
}

function deleteService(id) {
  const exists = state.services.some((s) => s.id === id);
  if (!exists) throw new Error("Service not found.");
  const inUse = state.tickets.some((t) => t.service.id === id);
  if (inUse) {
    throw new Error("Cannot delete a service that is currently in the queue.");
  }
  state.services = state.services.filter((s) => s.id !== id);
}

function updateConfig({ minNumber, maxNumber }) {
  minNumber = Number(minNumber);
  maxNumber = Number(maxNumber);
  if (!Number.isInteger(minNumber) || !Number.isInteger(maxNumber)) {
    throw new Error("Range values must be whole numbers.");
  }
  if (minNumber < 1 || maxNumber < minNumber) {
    throw new Error("Invalid range: minimum must be at least 1 and no greater than maximum.");
  }
  if (maxNumber - minNumber + 1 > 500) {
    throw new Error("Range is too large (max 500 numbers).");
  }
  const outOfRange = state.tickets.some(
    (t) => t.number < minNumber || t.number > maxNumber
  );
  if (outOfRange) {
    throw new Error(
      "Cannot apply this range while a ticket outside it is still active. Complete or clear those tickets first."
    );
  }
  state.config = { minNumber, maxNumber };
  return state.config;
}

module.exports = {
  publicState,
  getAvailableNumbers,
  createTicket,
  findTicketByNumber,
  callNextTicket,
  serveTicket,
  completeTicket,
  recallTicket,
  addService,
  updateService,
  deleteService,
  updateConfig,
};
