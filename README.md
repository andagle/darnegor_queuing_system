# DAR Negros Oriental — Queuing System

A web-based queuing system for daily walk-in transactions at the DAR Negros
Oriental Provincial Office. React front end, Node/Express + Socket.IO back
end, no database — the queue lives in server memory and is pushed live to
every connected screen.

## What's included

Four pages, exactly as specified:

1. **Landing** (`/`) — choose **Client** or **Staff (Admin)**.
2. **Client** (`/client`) — a grid of numbers (default 1–20). Taken numbers
   are greyed out and unclickable. Picking a number opens a pop-up to choose
   a service, then the client is taken straight to the waiting dashboard
   with their ticket highlighted.
3. **Admin** (`/admin`) — call the next number (or a specific one), re-announce,
   complete transactions, manage the list of services (add/rename/delete),
   and change the numbering range (default 1–20).
4. **Waiting / Queuing Dashboard** (`/waiting`) — the lobby display. Shows
   "Now Serving," the waiting list, and recently-called history. When staff
   call a number it's announced out loud with the browser's speech synthesis
   ("Number 5, please proceed to the counter for Land Title Processing") and
   flashes on screen. Meant to be left open on a lobby TV/monitor as well as
   on each client's own device.

Everything syncs live across every open tab/device via Socket.IO — no
refreshing needed, and no database to set up.

## Project structure

```
dar-queue-system/
├── server/     Express + Socket.IO API (in-memory state)
├── client/     React (Vite) front end
└── package.json  convenience scripts to run both together
```

## Run it locally

Requires Node.js 18+.

```bash
npm run install:all   # installs deps for both server and client
npm run dev            # runs API on :4000 and Vite dev server on :5173
```

Open **http://localhost:5173**. The Vite dev server proxies `/api` and
`/socket.io` to the backend automatically (see `client/vite.config.js`), so
you don't need to configure CORS or URLs by hand.

Open the app in a few different tabs to see the client, admin and waiting
dashboard talk to each other live — that's how it behaves across separate
devices (client's phone, staff PC, lobby TV) once deployed.

## Deploying

The backend also serves the built front end as static files, so the whole
app deploys as a **single Node service** — no separate static host needed.

```bash
npm run build     # builds client/dist
npm start         # builds (again, harmless) then starts the server, which
                   # now also serves client/dist and the API on one port
```

The server listens on `process.env.PORT || 4000`, so it works out of the box
on Render, Railway, Fly.io, an EC2/VPS behind a reverse proxy, etc.

### Example: Render / Railway (single Web Service)
- Build command: `npm run install:all && npm run build`
- Start command: `npm start --prefix server`
- No database add-on needed.
- Set the health check path to `/api/health`.

### Example: plain VPS
```bash
git clone <your-repo>
cd dar-queue-system
npm run install:all
npm run build
PORT=4000 node server/index.js   # or run under pm2 / systemd
```
Put Nginx or Caddy in front for TLS and point it at port 4000.

> **About "no database":** the queue, services, and range configuration all
> live in the Node process's memory and are broadcast to every browser over
> Socket.IO. This is intentional per the project brief — it keeps the system
> simple for daily walk-in queuing. The trade-off is that state resets if the
> server process restarts (e.g. a redeploy). If you later want the queue to
> survive restarts, the `server/store.js` module is the single place to swap
> in a real database or a persistence layer (e.g. Redis, SQLite) without
> touching the front end or the routes.

## Customizing

- **Services** (the pop-up choices clients pick from) are managed entirely
  from the Admin → Services tab. There's no code change needed to add,
  rename, or remove one.
- **Queue range** (default 1–20) is managed from Admin → Queue Range.
- **Theme**: white + neon green, with a dark mode toggle in the header of
  every page (saved to the browser so it's remembered next visit).
- **Voice announcements** use the browser's built-in Speech Synthesis API on
  the waiting dashboard — no external service or API key required. The first
  visit to that page requires one tap on "Enable voice announcements" due to
  browser autoplay rules; after that it announces automatically.
