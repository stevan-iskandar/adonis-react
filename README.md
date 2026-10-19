# adonis-react

An internal admin panel built with AdonisJS 7, Inertia and React, written as a learning project for moving from Laravel to AdonisJS. It follows the same patterns as our Laravel projects (domain layer, fetch/modify repositories, role-based access), so the two can be compared side by side.

## What it does

- **Users, roles and permissions** (System). A user holds one or more roles, and a role holds permissions. `ADMIN` has every permission and `STAFF` has the asset ones.
- **Assets** (Master), the first module open to clients outside the panel. *Planned.*
- **Two ways in.** Staff use the panel with a session login and an optional "remember me" lasting 30 days. Other applications will call `/api` with a Bearer token from `POST /api/login` (*planned*).
- **Permissions are checked on every `/api` route.** The check uses the permission codes captured at login, and the panel hides menus and buttons the user cannot use.

## Stack

Exact versions are in [package.json](package.json).

| Layer | Tools |
| --- | --- |
| Backend | Node 24+, AdonisJS 7, Lucid (PostgreSQL), VineJS, `@adonisjs/auth` (session and access tokens) |
| Frontend | Inertia 3 + React 19, TypeScript, Vite, Ant Design 6, Tailwind 4, Lucide icons, axios |
| Typed routes | Tuyau: route names, request bodies and responses are checked by TypeScript in React |
| Quality | ESLint + Prettier, Japa |

## Getting started

### Requirements

- Node.js 24 or newer
- PostgreSQL, with one database for development and one for tests

### Setup

```bash
npm ci
cp .env.example .env
node ace generate:key
```

Then fill in `.env`. The settings that have no working default:

| Key | Notes |
| --- | --- |
| `DB_CONNECTION` | `pg`. The example file still says `sqlite`, as the starter did. |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` | Your PostgreSQL server. |
| `ADMIN_EMAIL`, `ADMIN_PASS` | The first admin account, created by the seeder. `ADMIN_PASS` is required only while that user does not exist yet. Without `ADMIN_EMAIL` the seeder uses `admin@email.com`. |
| `VITE_ADMIN_EMAIL`, `VITE_ADMIN_PASS` | Development only: they prefill the login form. **Leave them empty anywhere you build for production.** Every `VITE_*` value is written into the JavaScript the browser downloads. |

`.env.test` overrides `.env` when tests run. Set its `DB_DATABASE` to the test database.

Create the tables and the first admin, then start the dev server:

```bash
node ace migration:run
node ace db:seed
npm run dev
```

Open `http://localhost:3333` and log in with `ADMIN_EMAIL` / `ADMIN_PASS`.

Keep `npm run dev` running while you work. Besides hot reload, it regenerates `.adonisjs/`, the typed route registry and page types that React and the route files depend on. Without the server running, `node ace codegen` does the same.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload and code generation |
| `npm run build` | Production build into `build/` |
| `npm start` | Runs the built server (`node bin/server.js`) |
| `npm test` | Japa tests, against the database in `.env.test` |
| `npm run lint` | ESLint, including Prettier formatting |
| `npm run format` | Prettier, writing the fixes |
| `npm run typecheck` | TypeScript for the backend and for `inertia/` |
| `node ace list:routes` | Every route with its name, handler and middleware |

Run `format`, `lint`, `typecheck` and `test` before you push.

## Project layout

```
app/
  domain/{group}/{module}/    entity, fetch and modify repositories, service, constants
  controllers/{group}/        HTTP layer; talks only to services
  validators/{group}/         VineJS request validation
  transformers/{group}/       response shapes
  library/                    shared base classes and helpers
  middleware/                 auth, apiAuth, access, Inertia shared props
  exceptions/handler.ts       every error turned into a response
start/routes/{web,api}/       one file per module
database/                     migrations, seeders, generated schema.ts
inertia/
  pages/{group}/{module}/     React pages
  layouts/, components/
  library/                    axios classes, constants, helpers, hooks
```

Files under `.adonisjs/`, and `database/schema.ts`, are generated. Never edit them by hand.

## Documentation

- [.claude/conventions.md](.claude/conventions.md): the rules, with every decision dated
- [.claude/architecture.md](.claude/architecture.md): how the pieces fit together, and what is built or planned
- [.claude/guide.md](.claude/guide.md): AdonisJS explained for a Laravel developer, using this project's code
- [CHANGELOG.md](CHANGELOG.md): changes per version, with unreleased ones on top. *Starts with the first change that alters behaviour.*

## Contributing

- Work on `main`, and write commit messages as one imperative sentence about the behaviour, in English.
- Add a `CHANGELOG.md` entry under `Unreleased` in the same commit.
- Ask before adding a dependency, a top-level folder, a schema change or a new domain group.
