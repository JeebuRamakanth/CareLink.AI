# CareLink.AI Replica

This is a **separate runnable copy of the inspected CareLink.AI source UI**, located under `carelink-ai-replica/` in the original repository. It does not replace or deploy over the original application.

## Run
Requirements: Node.js 20+ and npm.

```bash
cd carelink-ai-replica
npm install
npm run dev
```

Quality commands:

```bash
npm test
npm run lint
npm run build
npm run preview
```

## Environment
Create `.env.local` in this folder only when connecting to an isolated development Supabase project:

```env
VITE_SUPABASE_URL=https://YOUR_DEV_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_DEV_PUBLISHABLE_KEY
```

Do not use a service-role key or AI provider secret in browser environment variables. Configure AI secrets only as server/Edge Function secrets in the development Supabase project. No credentials or patient records were copied.

## Scope and fidelity
The React app, stylesheet, entry point, HTML shell, and Supabase client are copied from the inspected repository source. This preserves the source-defined UI and behavior as a baseline, rather than creating an invented redesign. The inventory and verification matrix distinguish source evidence from screenshot-verified parity. No claim of pixel-perfect parity is made until paired screenshots and interaction tests are captured at matching viewport sizes.

See `replica-docs/` for the source inventory, component catalog, route/interaction map, design tokens, and verification matrix.
