# DocDuck

A collaborative real-time document editor. Think Google Docs, built from scratch with CRDTs for conflict-free collaboration.

## Features

**Real-time editing** — Multiple people can edit the same document at the same time. Cursors show where everyone is, and changes sync instantly through Yjs and Hocuspocus.

**Rich text formatting** — Headings, bold, italic, code blocks, blockquotes, lists (ordered, unordered, task lists), text alignment, colors, links, images, and more. Built on Tiptap (ProseMirror).

**Inline comments** — Select text and leave a comment. Reply to comments, resolve them, edit them. Everything syncs in real time.

**Version history** — Automatic snapshots of documents every 15 minutes. Browse old versions, preview their content, and restore them if needed.

**Sharing & permissions** — Invite people by email as editors or viewers. Manage collaborators, set document visibility (private or public). Invitations get sent via email with a unique accept link.

**Trash & recovery** — Documents can be soft-deleted, restored, or permanently removed. Only the owner can trash or permanently delete.

**Dark mode** — Because everyone has preferences.

## Built With

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, Tiptap 3 (ProseMirror)
- **Backend:** Express 5, Hocuspocus 3 (Yjs WebSocket server), BullMQ (background jobs)
- **Database:** PostgreSQL with Prisma (schema & migrations) + Kysely (type-safe queries)
- **Auth:** better-auth (email/password, sessions)
- **Real-time sync:** Yjs over WebSocket via Hocuspocus
- **API:** Type-safe RPC via ORPC with OpenAPI contract generation
- **Emails:** Resend (production), Mailpit (development), React Email templates
- **Monorepo:** pnpm workspaces, Turborepo, TypeScript 5.9

## Project Structure

```
apps/
  web/          Next.js frontend (dashboard, editor, landing page)
  server/       Express backend (API, WebSocket, DB, auth)
packages/
  ui/           Shared React component library
  eslint-config/  Shared ESLint configs
  typescript-config/  Shared TS configs
  transactional/  React Email templates
  mailpit/      Dev SMTP server launcher
```

## Prerequisites

- Node.js >= 18
- pnpm 10.32+
- PostgreSQL (running, with a database created)
- Redis (for the BullMQ email queue)
- Mailpit (for catching emails in development)

## Getting Started

```sh
pnpm install

# Set up environment — copy the example env files:
# apps/server/.env   — database URLs, auth secret, Resend key, etc.
# apps/web/.env      — NEXT_PUBLIC_SERVER_BASE_URL
# .env               — root-level Prisma connection string

# Generate Prisma client and Kysely types
pnpm --filter server run generate:dev

# Apply database migrations
pnpm --filter server run migrate:dev-apply
```

## Development

```sh
# Start both apps together
pnpm dev

# Or separately:
pnpm --filter web dev      # → http://localhost:3000
pnpm --filter server dev   # → http://localhost:1711
```

You'll also want Redis and Mailpit running:

```sh
pnpm --filter @repo/mailpit dev
```

## Commands

| Command | What it does |
|---------|-------------|
| `pnpm dev` | Start all apps in dev mode |
| `pnpm build` | Build everything |
| `pnpm lint` | Check linting across all packages |
| `pnpm check-types` | Run TypeScript type checking |
| `pnpm format` | Format code with Prettier |

## API

The server exposes a type-safe RPC API with an auto-generated OpenAPI contract. The frontend client consumes this contract directly for full type safety from server to client — no manual API client generation needed.

WebSocket connections for real-time editing run through Hocuspocus on the same Express server.

## Environment Variables

Key env vars for `apps/server/.env`:

```
PORT=1711
DATABASE_URL=postgresql://user:pass@localhost:5432/docduck
BETTER_AUTH_SECRET=<generate-a-secret>
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:1711
RESEND_API_KEY=<key>              # Production email
NODE_ENV=development
```

And for `apps/web/.env`:

```
NEXT_PUBLIC_SERVER_BASE_URL=http://localhost:1711
```

## Database

The project uses Prisma for schema management and migrations (40+ migrations and counting) with Kysely for type-safe query building. The `prisma-kysely` generator produces TypeScript types from the Prisma schema automatically.

## Contributing

This is an active project. Feel free to open issues or submit PRs.

## License

MIT
