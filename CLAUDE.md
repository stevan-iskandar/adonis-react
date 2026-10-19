# adonis-react

A learning sandbox: the owner, a Laravel developer, is learning AdonisJS 7 as a replacement for Laravel by building an internal admin panel — a System group (users, roles, permissions) and one Master table (assets) — to the same patterns as the Laravel sibling projects.

## Working mode — read first

- **The owner writes the code and runs the commands.** Claude explains, points at the right file, reviews, and proposes code in the reply. Claude does not edit files under `app/`, `config/`, `database/`, `inertia/`, `start/`, `tests/` or the root config files.
- To check a proposal, Claude works on a copy of the project in its scratchpad (with `node_modules` linked), never in the repository, and never against the owner's database.
- Claude may edit the documentation: this file, `README.md` and `.claude/*.md`.
- Explain Adonis concepts by mapping them to Laravel (see [guide.md](.claude/guide.md) §1).
- Discussion is in Indonesian. Code, comments, commit messages and repository docs are in English.
- This section is removed when the owner wants Claude to write code.

## Stack

Read exact versions from [package.json](package.json). Currently Node 24+, AdonisJS 7 (Lucid 22, auth 10, VineJS 4, shield, session), Inertia 3 with React 19, Tuyau (typed routes), TypeScript 6, Vite 8, antd 6, Tailwind 4, `lucide-react`, axios, PostgreSQL, Japa.

Decided but not installed: `@adonisjs/limiter` (login rate limit), `sti-antd-package` (tables), `dayjs` as a direct dependency.

Sibling projects the patterns come from — read the equivalent file there before inventing something:

- `D:\Projects\Laravel\task-list` — domain layout, fetch/modify repositories, axios layer, side menu
- `D:\Projects\Laravel\app-updater` — best-documented; changelog and commit style, `api.` route prefix
- `D:\Projects\NodeJS\cms-internal\master` — NestJS; services with optional transactions, `responseMessage`

## Directory layout

- `app/domain/{group}/{module}/` — `{module}_constant.ts`, `_entity.ts`, `_fetch_repository.ts`, `_modify_repository.ts`, `_service.ts`. Groups: `auth`, `system`, `master`.
- `app/controllers/{group}/`, `app/validators/{group}/`, `app/transformers/{group}/` — mirror the domain.
- `app/library/` — shared base classes and helpers (`#library/*`).
- `app/middleware/` — includes `api_auth_middleware.ts` (`apiAuth`) and `access_middleware.ts` (`access`).
- `start/routes/{web,api}/{group}/{module}.ts` — one file per module, called from each folder's `index.ts`.
- `inertia/pages/{group}/{module}/`, `inertia/layouts/`, `inertia/components/`, `inertia/library/{axios,constants,helpers,hooks}/`, `inertia/types/`.
- `.adonisjs/` and `database/schema.ts` — generated. Never edit by hand.

## Non-negotiable rules

- Controller → service → repository → entity. A controller never imports an entity, a repository or `db`.
- The service owns the transaction (`withTransaction(op, trx?)`); no `try/catch` in controllers; never swallow an error inside a transaction.
- JSON is `{ message, data }`, built from a transformer with `serialize()`. Errors are shaped by `app/exceptions/handler.ts` only.
- Every `/api` route carries `access({ permission })`, with the code taken from `permission_constant.ts`. A route without one is a bug.
- Imports use `#alias` paths, never relative `.ts` paths.
- Run `npm run format`, `npm run lint`, `npm run typecheck` and `npm test` before calling work finished.
- Do not add dependencies, top-level folders, schema changes or domain groups without asking.

## Documentation maintenance

- A confirmed decision goes into [.claude/conventions.md](.claude/conventions.md) under **Confirmed decisions**, dated. Something unclear goes under **Open questions** instead of being guessed.
- A module or flow that changes updates [.claude/architecture.md](.claude/architecture.md) in the same commit.
- A pattern the owner builds, or an Adonis behaviour worth knowing, goes into [.claude/guide.md](.claude/guide.md).
- Backlog and deferred work live in [.claude/todo.md](.claude/todo.md); finished items move to its Done section.
- A behaviour change adds a `CHANGELOG.md` entry under `Unreleased` in the same commit.

## Further reading

- [.claude/architecture.md](.claude/architecture.md) — structure, what is built, flows
- [.claude/guide.md](.claude/guide.md) — Adonis for a Laravel developer, with this project's code
- [.claude/todo.md](.claude/todo.md) — backlog and the decision history up to 2026-10-16

@.claude/conventions.md
