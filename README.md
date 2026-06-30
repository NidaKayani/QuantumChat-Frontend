# Quantum Chat — Frontend

This folder contains **all user-facing UI** for Quantum Chat.

## What's inside

| Folder | What it is | URL when running |
|--------|------------|------------------|
| `admin/` | Admin dashboard (manage websites, users, messages) | http://localhost:5174 |
| `widget/` | Chat widget (embeddable on company websites) | http://localhost:5173 |
| `sdk/` | JavaScript SDK for script-tag installation | (build output only) |

## How to run

> **Important:** Run `npm install` from the **project root** (`QuantumChat/`), not only inside `frontend/`.
> That installs dependencies for admin, widget, backend, and shared together.

### Run all frontend apps

```bash
# From project root
npm run dev:frontend

# OR from this folder
cd frontend
npm run dev
```

### Run individually

```bash
# Admin dashboard only
cd frontend/admin
npm run dev

# Chat widget only
cd frontend/widget
npm run dev
```

## Important

The frontend **needs the backend running** at `http://localhost:4000`.

Run backend first:
```bash
cd backend
npm run dev
```

Then run frontend in a second terminal.

## Folder structure

```
frontend/
├── admin/     # React admin panel
├── widget/    # React chat widget (LinkedIn-style UI)
└── sdk/       # Embed script for external websites
```
