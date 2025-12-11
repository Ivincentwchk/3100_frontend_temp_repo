# CSCI3100 Frontend

React + Vite single-page app that talks to the companion Django backend (`CSCI3100_project_backend_v2`). It handles registration, login, and dashboard display once a user authenticates.

## Tech stack

- React 19 + TypeScript
- Vite build tool
- Custom auth hooks (`src/feature/auth`)
- Tailwind-inspired styling via `index.css`

## Getting started

```bash
npm install
npm run dev    # starts Vite dev server (default http://localhost:3000)
```

To create a production build:

```bash
npm run build
npm run preview
```

## Environment

- Frontend expects the backend running on `http://localhost:8000` (configure via `VITE_API_URL` in `.env` if needed).
- Login flow relies on tokens stored in `localStorage` / `sessionStorage`; see `src/feature/auth/useAuth.ts`.

## Repository info

- Frontend repo: `https://github.com/Ivincentwchk/3100_frontend_temp_repo.git`
- Backend repo: `https://github.com/Ivincentwchk/v2.git`
