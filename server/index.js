const path = require("path");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const store = require("./store");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

function broadcastState() {
  io.emit("state", store.publicState());
}

// ---------- REST API ----------

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/state", (_req, res) => {
  res.json(store.publicState());
});

// Client picks a number + service -> creates a ticket
app.post("/api/tickets", (req, res) => {
  try {
    const { number, serviceId } = req.body;
    const ticket = store.createTicket({ number, serviceId });
    broadcastState();
    res.status(201).json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin calls the next waiting ticket in line
app.post("/api/tickets/call-next", (_req, res) => {
  try {
    const ticket = store.callNextTicket();
    if (!ticket) {
      return res.status(404).json({ error: "No one is waiting in the queue." });
    }
    broadcastState();
    io.emit("announce", {
      number: ticket.number,
      service: ticket.service.name,
    });
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin calls a specific ticket number out of order
app.post("/api/tickets/:number/serve", (req, res) => {
  try {
    const ticket = store.serveTicket(req.params.number);
    broadcastState();
    io.emit("announce", {
      number: ticket.number,
      service: ticket.service.name,
    });
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin re-announces a ticket that is already being served
app.post("/api/tickets/:number/recall", (req, res) => {
  try {
    const ticket = store.recallTicket(req.params.number);
    broadcastState();
    io.emit("announce", {
      number: ticket.number,
      service: ticket.service.name,
    });
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin marks a transaction as complete -> number becomes available again
app.post("/api/tickets/:number/complete", (req, res) => {
  try {
    const ticket = store.completeTicket(req.params.number);
    broadcastState();
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---- Services CRUD ----

app.post("/api/services", (req, res) => {
  try {
    const service = store.addService(req.body.name);
    broadcastState();
    res.status(201).json(service);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/services/:id", (req, res) => {
  try {
    const service = store.updateService(req.params.id, req.body.name);
    broadcastState();
    res.json(service);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/services/:id", (req, res) => {
  try {
    store.deleteService(req.params.id);
    broadcastState();
    res.status(204).end();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---- Config (queue number range) ----

app.put("/api/config", (req, res) => {
  try {
    const config = store.updateConfig(req.body);
    broadcastState();
    res.json(config);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---------- Serve the built React app in production ----------
const clientDist = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) next();
  });
});

// ---------- Socket.IO ----------
io.on("connection", (socket) => {
  socket.emit("state", store.publicState());
});

server.listen(PORT, () => {
  console.log(`DAR Queuing System server listening on port ${PORT}`);
});
