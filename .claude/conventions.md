# Conventions

The rules this codebase follows. The reasoning, Adonis internals and worked examples are in [guide.md](guide.md); how the pieces fit together is in [architecture.md](architecture.md). Every rule here was confirmed by the owner; the dated list is under **Confirmed decisions**, and the full discussion before 2026-10-16 is in [todo.md](todo.md) → Done.

## Naming and file placement

- Business code lives in `app/domain/{group}/{module}/`. Groups: `auth`, `system` (user, role, permission), `master` (asset). Ask before adding a group.
- Module folders are **singular** (`user/`, `asset/`). A module name is unique across groups, because URLs carry the module only.
- Files are **snake_case** with a role suffix, and every file in a module starts with the module name, so alphabetical order is build order:
  - `{module}_constant.ts` — the table name (`USER_TABLE = 'users'`) and other plain data
  - `{module}_entity.ts` — the Lucid model (`class User`)
  - `{module}_fetch_repository.ts` — reads only
  - `{module}_modify_repository.ts` — writes only
  - `{module}_service.ts` — the only thing a controller imports
- Outside the domain the path mirrors it: `app/controllers/{group}/{module}_controller.ts`, `app/validators/{group}/{module}_validator.ts`, `app/transformers/{group}/{module}_transformer.ts`, `start/routes/{web,api}/{group}/{module}.ts`.
- Shared base classes and helpers live in `app/library/` (`helpers/`, `mixins/`, `repositories/`, `services/`), never in a domain group.
- Imports use `#alias/...` paths from `package.json` `imports`, never relative paths ending in `.ts`. Set `"js/ts.preferences.importModuleSpecifier": "non-relative"` in VS Code. The frontend alias is `#inertia/*`.
- Generated files are never edited: `.adonisjs/**`, `database/schema.ts`.
- `make:*` generators write to the framework's default folders. Use `make:migration`; write every other file by hand where it belongs.

## Database

- PostgreSQL, for development and tests.
- A module starts with its migration: `make:migration` → `migration:run` → the entity extends the generated `{Module}Schema`. Until `0.1.0` a create-table migration is edited in place (`migration:rollback`, edit, `migration:run`); after it, every schema change is a new migration.
- Table names come from `{module}_constant.ts`, in the migration, the entity and `pivotTable`.
- Columns are snake_case; entity properties, JSON and React are camelCase. No column-name constants.
- Foreign keys are declared, `ON DELETE RESTRICT`. Exception: token tables' `tokenable_id` cascades.
- Master tables (`users`, `roles`, `assets`) carry `created_by_id` / `updated_by_id`, filled from the acting user's id passed controller → service.
- Soft deletes: `compose(Schema, SoftDeletes, …)` from `@codenameryuu/adonis-lucid-soft-deletes`. A unique `code`/`email` covers deleted rows too: storing a value held by a soft-deleted row restores that row with the new values.
- `code` fields are uppercase, normalised twice: `.trim().toUpperCase()` in the validator (before `.unique()`), and the `withUpperCase([...])` entity mixin.
- Ids are plain integers in URLs and payloads. No Hashids, no UUIDs.
- Dates are stored as UTC (`TZ=UTC`, `timestamptz`).

## Layers

- Controller → service → repository → entity, always in that order. A controller imports a service, a validator and a transformer, nothing from `#domain/**/*_entity`, `#domain/**/*_repository` or `@adonisjs/lucid/services/db`.
- Every query lives in a repository. Fetch repositories extend `BaseFetchRepository` and take `FetchOptions` (`{ trx, withTrashed }`); `withTrashed` is a type error on a model without `SoftDeletes`. Audit relations preload with `withTrashed()`.
- The service owns the transaction: `this.withTransaction(op, trx?)` from `BaseService`, joining a caller's `trx` when given one. Repositories receive the `trx` and pass `{ client: trx }`.
- Update semantics: `undefined` leaves a field unchanged, `null` clears it. Modify repositories apply `definedOnly(data)` before `merge()`.
- Passwords are saved through the entity instance, so `withAuthFinder`'s hook hashes them.
- Wiring is `@inject()` with constructor parameters imported as values, never `import type`.

## Validation

- Validators are module-level exports in their own file (`createUserValidator`, `updateUserValidator`), never a `const` inside a controller — Tuyau finds a validator only through its import.
- A `unique` / `exists` filter is written with braces: `filter: (db) => { db.whereNull('deleted_at') }`.
- Messages are English.

## Errors

- Controllers have no `try/catch`. `app/exceptions/handler.ts` maps every error.
- A business rule throws `new Exception(message, { status })`.
- A `try/catch` only translates an error and always rethrows. Never swallow an error inside a transaction: Lucid would commit the partial writes.
- `/api/*` always answers JSON, whatever the `Accept` header: `{ message }` with the status, and for validation 422 `{ message, errors: { field: [msg, …] } }`. In production a 5xx message is "Internal server error".
- Pages get status pages: 404 → `errors/not_found`, 5xx → `errors/server_error`.
- A missing permission is 403, never 401.
- Side effects outside the database (files, mail) run after the commit.

## Responses

- JSON uses the envelope `{ message, data }`: `{ message: responseMessage(this.module).successInsert, ...(await serialize(XTransformer.transform(x))) }`. A delete returns `{ message }`.
- A create answers 201.
- Output shape comes from a transformer only. A nested transformer resolves one level; a deeper include sets `.depth(n)`.
- Inertia props pass the transformer `Item` at the top level; an `Item` nested in a plain object goes through `serialize.withoutWrapping(...)`.
- Dates cross the boundary as ISO 8601 strings, in both directions.

## Routes

- Each route file exports a named function (`export function userRoutes()`), called by its folder's `index.ts`.
- Handlers come from `actions` (`actions.system.User.store`), never `[Controller, 'method']`.
- Names: `{web|api}.{group}.{module}.{action}`. The outer group gives `web`/`api`, the parent's `.as('{group}')` the group, the file's `.prefix(module).as(module)` the module, each route's `.as()` the action. Auth routes are `web.auth.login`, `web.auth.login.submit`, `web.auth.logout.submit`.
- URLs carry the module only: `/user`, `/api/user/:id`. `:id` is constrained with `router.matchers.number()`.
- Every `/api` route carries `.use(middleware.access({ permission: permission.xView }))`. A route without one is a bug.
- `/api` groups use `middleware.apiAuth({ external })`: `system` is `external: false` (panel only), `master` is `external: true`. Never `middleware.auth({ guards: ['web', 'api'] })` on `/api`.
- No `router.resource()`.

## Permissions

- Codes are defined once in `app/domain/system/permission/permission_constant.ts` (`userView: 'S.0.1'`), typed `PermissionSlug`. Nobody writes a code as a string, on either side.
- Code format: group letter (`G` general, `M` master, `S` system), module index, action index. The row's `name` (`user-view`) is derived from the key by the seeder.
- Actions are `view`, `create`, `edit`, `delete`.
- `ADMIN` holds every code automatically; `STAFF` holds the asset codes.
- Requests are checked against the codes written at login (session key `ABILITIES_SESSION_KEY`, or the token's abilities), read with `abilitiesOf(ctx)`. A change to roles reaches a user at their next login.
- React hides what the user may not use (`useAccess().can()`, `useSideMenus()`); the route middleware is what enforces.
- `*_constant.ts` files are imported by React, so they hold plain data only: no import of Lucid, `env` or other server code.

## Frontend

- antd v6 for components, `lucide-react` for every icon (`size="1em"` inside antd), Tailwind for layout, spacing and colour.
- An antd component's internals are styled through `ConfigProvider` theme tokens, not Tailwind classes. Tailwind may size and place its outer box.
- Colours are antd tokens; Tailwind reads them as `--ant-*` variables (`@theme inline` in `app.css`). No other global CSS.
- Files are snake_case, exported components PascalCase. Pages: `inertia/pages/{group}/{module}/{index,create,edit,show}.tsx`, named after the controller method that renders them. A module's components: `inertia/components/{group}/{module}/`, never under `pages/`.
- Support code: `inertia/library/{axios,constants,helpers,hooks}/`; types in `inertia/types/`.
- A page gets its initial data as Inertia props, typed `Data.{Group}.{Module}`. No frontend model classes.
- Tables and every create, update and delete go to `/api` through the module's axios class and an antd `Form`. Only login and logout use Inertia's `<Form>`.
- One axios class per module, `inertia/library/axios/{group}/{module}_axios.ts`, extending `BaseAxios` with `readonly resource = 'api.{group}.{module}'`. A call beyond CRUD uses `this.request(routeName, args)`. Never a hand-written URL.
- Errors: the interceptor handles 401, 403, 413 and 5xx; the caller handles 422 (mapped onto the form) and other 4xx.
- The side menu is defined once, in `side_menu_constant.tsx`, with `permission` and `path` (`urlFor(...)`) per item.
- Shared props live under `auth` (`auth.user`, `auth.permissions`) so they never collide with page props.
- Only `VITE_*` variables reach React, and they are baked into the bundle at build time: never a secret.
- Dates are shown in the browser's time zone as `DD MMM YYYY HH:mm`, through one helper.
- UI text is English; antd locale `en_US`. SSR is off.

## Tests

- Japa functional tests cover the core business flows, not every endpoint.
- They call `/api` with a logged-in session, run inside `testUtils.db().withGlobalTransaction()`, and build data with factories in `database/factories/`.
- Files: `tests/functional/{group}/{module}.spec.ts`. The test database is `DB_DATABASE` in `.env.test`.

## Checks

Before finishing: `npm run format`, `npm run lint` (ESLint and Prettier), `npm run typecheck` (backend and `inertia/`), `npm test`. CI runs `node ace codegen` first, since `.adonisjs/` is not committed.

## Git and releases

- Default branch `main`, on `github.com/stevan-iskandar/adonis-react`. Commits go straight to `main` while one person works on it.
- A commit message is one imperative sentence about the behaviour ("Restore a soft-deleted user when its email is stored again"), no type prefix, in English.
- `CHANGELOG.md` follows Keep a Changelog and SemVer. A behaviour change adds its entry under `## [Unreleased]` in the same commit, as a bold headline followed by why, under `Added` / `Changed` / `Removed` / `Fixed`. When the owner says to bump the version, `Unreleased` becomes `## [x.y.z] - YYYY-MM-DD` in one go and a fresh `Unreleased` goes above it.
- Tags are `vX.Y.Z`, annotated with `--cleanup=verbatim`, made only when the owner asks. The first release is `0.1.0`.
- Line endings are LF. `.adonisjs/` is not committed. `.claude/` is, except `settings.local.json`.

## Never without asking

New dependencies, new top-level folders, schema changes, and new domain groups.

## Confirmed decisions

Newest first. "Divergence" marks a deliberate difference from the Laravel sibling projects.

- **2026-10-16** — CHANGELOG collects entries under `Unreleased` and is cut into a version only when the owner says so. Divergence from app-updater, which versions every change.
- **2026-10-16** — Default branch `main`; `.claude/` docs are committed; learning mode is stated in `CLAUDE.md`.
- **2026-10-16** — Dates cross the boundary as ISO 8601, are stored as UTC, and are shown in the browser's time zone as `DD MMM YYYY HH:mm`.
- **2026-10-16** — English UI and messages; antd locale `en_US`.
- **2026-10-16** — Functional tests through `/api` with a session, inside a global transaction, with factories.
- **2026-10-16** — antd for components, Lucide for icons, Tailwind for layout and colour. antd sits in the `antd` CSS layer between Tailwind's `base` and `utilities` (`<StyleProvider layer>`), so preflight never breaks antd and a utility always wins; colours are antd tokens read by Tailwind as CSS variables. Reason for the layer: an unlayered rule beats every layered one.
- **2026-10-16** — Panel writes go through axios to `/api`; pages keep props for their initial data; login and logout keep Inertia's `<Form>`. Amends the 2026-09-24 "pattern B" (props and form posts only).
- **2026-10-16** — Page paths keep the group (`system/user/edit`), the URL does not.
- **2026-10-16** — `BaseAxios` types its CRUD calls from the registry through `readonly resource`, so a body is checked against the validator and a response against the controller.
- **2026-10-16** — No frontend model classes (`class-transformer`): transformers define the shape. Divergence from task-list.
- **2026-10-16** — Side menu defined once with a permission per item, filtered by `useSideMenus()`; `useAccess().can()` for buttons. Permission codes come from the backend constant; ESLint's `no-backend-import-in-frontend` allows `#domain/**/*_constant`.
- **2026-10-16** — `abilitiesOf()` returns `string[]`: the codes come from the database and may outlive a constant's change, so `PermissionSlug[]` would be a cast. Typos are caught where a code is written.
- **2026-10-16** — SSR off.
- **2026-10-15** — Frontend alias `#inertia/*` in `package.json` `imports`, replacing the starter's `~/*`, so project aliases sort first.
- **2026-10-15** — axios (ported from task-list) with URLs from Tuyau's `client.getRoute()`, the counterpart of Wayfinder.
- **2026-10-12** — Permissions are read from what login wrote (session copy or token abilities), never queried per request, so one `access` middleware serves both guards. Divergence from task-list's per-request query.
- **2026-10-12** — Tests cover the core business flows only. Divergence from app-updater's every-endpoint rule.
- **2026-10-12** — `.adonisjs/` not committed; CI with GitHub Actions; LF line endings; the Bruno collection lives outside the repository.
- **2026-10-12** — `/api/*` errors are always JSON; 5xx messages hidden in production.
- **2026-10-12** — Success messages from `responseMessage(module)`, as in cms-internal.
- **2026-10-09** — Codes uppercase in the validator and in the entity mixin. `ADMIN_PASS` is required only when the admin does not exist yet.
- **2026-10-08** — Soft deletes through `@codenameryuu/adonis-lucid-soft-deletes`, with `FetchOptions { trx, withTrashed }`.
- **2026-10-08** — List tables fetch rows from `/api` in the DataTables protocol; a frontend helper adapts the plain envelope to `sti-antd-package`'s `yajra` table. `qs` parses with `arrayLimit: 100, comma: false`.
- **2026-10-08** — Role codes `ADMIN` / `STAFF`. Seeding runs only `database/seeders/main/database_seeder.ts`, which awaits plain seeder functions. Permissions have no soft delete.
- **2026-10-08** — Frontend stack antd v6 + `sti-antd-package` + Tailwind. First release `0.1.0`. Commit style from app-updater. The never-without-asking list.
- **2026-10-01** — Permission codes `G|M|S.module.action`, names derived by the seeder. Table names in `{module}_constant.ts`. Token tables `auth_access_tokens` / `auth_remember_tokens`, cascading on user delete.
- **2026-09-30** — `/api` serves the panel (session) and external clients (Bearer, `POST /api/login`, 30-day tokens) through `apiAuth({ external })`; CSRF is skipped only for Bearer requests to `/api/*` and for `/api/login`.
- **2026-09-30** — camelCase everywhere above the database. Envelope `{ message, data }`. Validation errors in Laravel's shape, produced by overriding `renderValidationErrorAsJSON`. All error mapping in the handler.
- **2026-09-30** — Plain integer ids (divergence from Hashids). `ON DELETE RESTRICT`. Audit columns on master tables. Uppercase codes. Unique codes span soft-deleted rows.
- **2026-09-25** — Route names prefixed `web.` / `api.`. Route files export named functions. `#alias` imports only.
- **2026-09-24** — Domain layout, singular modules, snake_case role-suffixed files, fetch/modify split, service-owned transactions, `@inject()` (divergence from `new`), validators in `app/validators/{group}/`, `actions` route handlers, URLs without the group, `undefined`/`null` update semantics, foreign keys declared (divergence from task-list).
- **2026-09-24** — Auth: email-only login, no public signup, remember-me opt-in for 30 days, login limited to 5 failed attempts per minute per email + IP (`@adonisjs/limiter`, memory store), `access` middleware with 403 and a forbidden page, permissions shared with React.
- **2026-09-23** — A learning sandbox: System (users, roles, permissions) plus one master table (assets). PostgreSQL.

## Open questions

- **2026-10-19** — Commit `.adonisjs/` after all? The 2026-10-12 decision not to commit it predates finding that a fresh clone cannot run `node ace` until it is regenerated. See [todo.md](todo.md) → Open.
