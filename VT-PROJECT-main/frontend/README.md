# SheRoute — Frontend

This is the frontend for SheRoute: a React + Vite app with maps, Firebase auth, and Firestore.

## Tech stack
- Vite + React 19 + TypeScript
- Tailwind CSS
- Leaflet (maps)
- Firebase (Auth, Firestore)
- Zustand (state management)
- Recharts, Framer Motion

## Prerequisites
- Node.js (recommended >= 18)
- npm (we use `npm` for install and dev scripts)

## Setup (npm)
1. Open a terminal and go to the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create environment variables: copy the example and fill values:

```bash
cp .env.example .env.local
# then edit .env.local and paste Firebase config values
```

Vite expects environment variables prefixed with `VITE_`. See `.env.example` for required keys.

4. Start the dev server:

```bash
npm run dev
```

The dev server runs via Vite (`vite --host 0.0.0.0`).

## Build and Preview

```bash
npm run build
npm run preview
```

## Environment variables
The frontend currently uses Firebase. Provide these variables in `.env.local` (or your preferred env file):

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Note: Do not commit your `.env.local` with secrets — add it to `.gitignore` if not already ignored.

## Where to look
- Main entry: `src/main.tsx`
- App: `src/App.tsx`
- Firebase init: `src/firebase.ts`

## Recommendations
- Move hardcoded Firebase config from `src/firebase.ts` to environment variables (I can patch this if you want).
- Use a single package manager (you currently have both `pnpm-lock.yaml` and `package-lock.json`).
- Add a project-level `README.md` with full-stack run instructions if you plan to run backend too.

If you want, I can update `src/firebase.ts` to read from `import.meta.env` and create a `.env.local` template automatically.
