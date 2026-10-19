# Architecture

How the application is put together, and what is built versus planned. Rules are in [conventions.md](conventions.md); explanations for a Laravel developer, with code, are in [guide.md](guide.md). Update this file in the same commit as a module or flow that changes it.

## What it is

A learning sandbox for moving from Laravel to AdonisJS 7: an internal admin panel with a **System** group (users, roles, permissions) and one **Master** table (assets). It is built to the same patterns as the Laravel sibling projects (task-list, app-updater) so the two can be compared side by side.

| Audience | Where | How it authenticates |
| --- | --- | --- |
| Staff (Admin, Staff roles) | the Inertia + React panel, and `/api` from it | session cookie from `/login`, optional remember-me |
| External clients (planned) | `/api` groups marked external | `Authorization: Bearer` token from `POST /api/login` |

## What exists today

As of 2026-10-16.

| Area | State |
| --- | --- |
| Session login / logout, remember-me (30 days) | built |
| Permission codes written into the session at login, `access` middleware, `apiAuth` | built |
| User module: `/api/user` show, options, store, update, delete, change password; edit page | built |
| User list (`GET /api/user` with DataTables) | planned — `index` currently returns the options query |
| Role module | entity, fetch repository and seeder built; service, controller, routes planned |
| Permission | entity, constant and seeder built; read-only, no screen |
| Asset module (`master`, first external group) | planned |
| `POST /api/login` (tokens), shield exemption for Bearer | planned; the `api` guard and `auth_access_tokens` table exist |
| Login rate limit | planned |
| Panel: layouts, login page, side menu, flash toasts, typed axios layer | built |
| Panel: user list and form pages | planned |
| Tests, CI | planned |

## Layering

```
HTTP request
  → start/kernel.ts middleware (session, shield, initialize_auth, silent_auth)
  → route (start/routes/{web,api}/…) + named middleware (auth | apiAuth, access)
  → controller            app/controllers/{group}/{module}_controller.ts
      validator           app/validators/{group}/{module}_validator.ts
      service             app/domain/{group}/{module}/{module}_service.ts      owns the transaction
        fetch repository  …/{module}_fetch_repository.ts                       reads
        modify repository …/{module}_modify_repository.ts                      writes
          entity          …/{module}_entity.ts                                  Lucid model on the generated schema
      transformer         app/transformers/{group}/{module}_transformer.ts     output shape
  → JSON envelope { message, data } | Inertia page with props
  errors at any step → app/exceptions/handler.ts
```

Shared building blocks are in `app/library/`: `BaseService` (`withTransaction`), `BaseFetchRepository` (`query(options)`, `FetchOptions`, `firstOrNotFound`, `search`), `withUpperCase` mixin, and the helpers `abilities`, `object` (`definedOnly`), `response_message`, `route` (`actions`).

## Domain groups and data

| Group | Module | Table | Notes |
| --- | --- | --- | --- |
| `auth` | `auth_access_token` | `auth_access_tokens` | access tokens for the `api` guard; cascade on user delete |
| `auth` | `auth_remember_token` | `auth_remember_tokens` | remember-me tokens; cascade on user delete |
| `system` | `user` | `users` | soft deletes, audit columns, unique email across deleted rows |
| `system` | `role` | `roles` | soft deletes, uppercase `code` (`ADMIN`, `STAFF`) |
| `system` | `permission` | `permissions` | seeded from `permission_constant.ts`; no soft delete |
| `system` | `user_role` | `user_roles` | pivot, user ↔ role, many-to-many |
| `system` | `role_permission` | `role_permissions` | pivot, role ↔ permission |
| `master` | `asset` | `assets` | planned |

A user's permissions are the union of their live roles' permissions. Every foreign key is `RESTRICT`, so a role still assigned, or a user still referenced by an audit column, cannot be hard-deleted; deletes in the panel are soft.

Seeding (`node ace db:seed`) runs `database/seeders/main/database_seeder.ts`: permissions from the constant, roles (`ADMIN` gets every code, `STAFF` the asset codes), then the admin user from `ADMIN_EMAIL` / `ADMIN_PASS`.

## Routes

```
start/routes/index.ts          apiRoutes(), webRoutes()
  api/index.ts                 prefix /api, names api.*
    system  → apiAuth({ external: false })   api/system/user.ts
    master  → apiAuth({ external: true })    planned
  web/index.ts                 names web.*
    auth.ts                    /login, /logout          (guest / auth)
    auth group                 /, system/user.ts pages
```

## Authentication and permissions

**Session (panel).** `POST /login` validates, calls `UserService.validateUser` (`verifyCredentials`), logs in with the optional remember flag, and writes the user's permission codes into the session under `ABILITIES_SESSION_KEY`. Logout clears both. `silent_auth` runs on every routed request; when a session was restored from the remember-me cookie, it writes the codes once.

**Token (planned).** `POST /api/login` will issue a 30-day access token carrying the same codes as its `abilities`.

**`apiAuth({ external })`.** With a Bearer header: 401 on a panel-only group, token guard only on an external group. Without one: the session guard. The guards are never tried one after another, because a request that skips CSRF (Bearer) must never be accepted on its cookie. Guide §11 has the attack this prevents.

**`access({ permission })`.** Reads `abilitiesOf(ctx)` — the token's abilities or the session's codes — and answers 403 when the code is missing. No database query per request; a role change reaches a user at their next login.

**React.** `share()` sends `auth.user` (through `UserTransformer`) and `auth.permissions` to every page. `useAccess().can(code)` and `useSideMenus()` hide what the user cannot use.

## The panel

Inertia renders React pages from `inertia/pages/{group}/{module}/`; navigation is SPA-style.

```
inertia/app.tsx           page resolver; MainLayout is the default layout, a page may set its own (login → AuthLayout)
inertia/application.tsx   StyleProvider layer → ConfigProvider (en_US, theme) → antd App → page
```

| Data | Path |
| --- | --- |
| Page's initial data | controller → `inertia.render(page, { x: XTransformer.transform(x) })` → props typed `Data.{Group}.{Module}` |
| Shared | `share()` → `usePage().props.auth` |
| Tables, create, update, delete | module axios class (`BaseAxios`, typed from the Tuyau registry) → `/api` → `{ message, data }` |
| Flash messages | session flash → `usePage().flash` → `FlashToaster` |

Styling: antd components, Lucide icons, Tailwind for layout and colour. antd's CSS is in the `antd` cascade layer between Tailwind's `base` and `utilities`; Tailwind's colours read antd's `--ant-*` variables, so one set of tokens drives both.

## Error handling

| Caller | Validation | Other errors |
| --- | --- | --- |
| `/api/*` or `Accept: application/json` | 422 `{ message, errors: { field: [msg] } }` | status + `{ message }`; 5xx message hidden in production |
| Inertia page / form | flashed errors, redirect back | 404 and 5xx status pages; planned: 403 page, 4xx flash + redirect back |

Planned: Postgres `23505` (unique) and `23503` (foreign key) translated to 409.

On the client, the axios interceptor handles 401 (to login), 403, 413 and 5xx; the calling form handles 422 and other 4xx.

## Generated code

| File | Generated by | From |
| --- | --- | --- |
| `database/schema.ts` | `migration:run`, `schema:generate` | the migrated database |
| `.adonisjs/server/controllers.ts` | dev server, `node ace codegen` | `app/controllers/**` (feeds `actions`) |
| `.adonisjs/server/pages.d.ts` | the same | `inertia/pages/**` (checks `inertia.render`) |
| `.adonisjs/client/**` | the same | routes, validators, controllers, transformers (Tuyau registry, `Data.*` types) |

None is committed except `database/schema.ts`; CI regenerates `.adonisjs/` before typechecking.
