# Building in AdonisJS by hand — a guide for a Laravel developer

This project is where the owner learns AdonisJS as a replacement for Laravel. **The owner creates every file and runs every command**; Claude explains, points at the right file and reviews. This guide describes the patterns as they are built in the repository; the rules and their dates are in [conventions.md](conventions.md), and the discussion behind decisions made before 2026-10-16, with rejected options, is in [todo.md](todo.md) → Done. Sections marked **Not built yet** describe a decided pattern that has no code yet.

## 1. Laravel → AdonisJS map

| Laravel                                              | AdonisJS 7 (this repo)                                                                                                                                                                    |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `php artisan …`                                      | `node ace …`                                                                                                                                                                              |
| `routes/web.php`, `routes/api.php`                   | `start/routes/index.ts` calling `apiRoutes()` and `webRoutes()` (§5), preloaded at boot by [adonisrc.ts](../adonisrc.ts)                                                                  |
| `bootstrap/app.php` → `withMiddleware`               | [start/kernel.ts](../start/kernel.ts): `server.use` (every request, even 404s), `router.use` (every matched route), `router.named` (aliases such as `auth`, `guest`, `apiAuth`, `access`) |
| `config/*.php` + `env()`                             | `config/*.ts`; every env var is declared and validated in [start/env.ts](../start/env.ts) and read with `env.get()` in config files only                                                  |
| Eloquent model                                       | Lucid model ("entity" here), extending a class generated into [database/schema.ts](../database/schema.ts)                                                                                 |
| `SoftDeletes` trait                                  | `compose(Schema, SoftDeletes, …)` from `@codenameryuu/adonis-lucid-soft-deletes` (§6)                                                                                                     |
| `FormRequest` / `$request->validate()`               | VineJS validator (`vine.create({...})`), used as `await request.validateUsing(validator)`                                                                                                 |
| API Resource                                         | Transformer (`BaseTransformer`) in `app/transformers/{group}/`, serialized with `ctx.serialize()` from [providers/api_provider.ts](../providers/api_provider.ts)                          |
| Exception handler (`withExceptions`)                 | [app/exceptions/handler.ts](../app/exceptions/handler.ts) — one class for the whole app (§4)                                                                                              |
| `$request->user()`                                   | `ctx.auth.user` (maybe undefined) / `ctx.auth.getUserOrFail()`                                                                                                                            |
| `DB::beginTransaction()` / `commit()` / `rollBack()` | `await db.transaction(async (trx) => …)` — commits on return, rolls back on throw; wrapped by `BaseService.withTransaction`                                                               |
| Service container, `app()`                           | IoC container; `@inject()` on a class gives constructor injection                                                                                                                         |
| `access:` middleware / Gate                          | the project's `access` middleware with the permission codes written at login (§7)                                                                                                         |
| `HandleInertiaRequests::share()`                     | `share()` in [app/middleware/inertia_middleware.ts](../app/middleware/inertia_middleware.ts)                                                                                              |
| Wayfinder                                            | Tuyau: route names checked at compile time in React (`<Form route="web.auth.login.submit">`, `urlFor('web.home')`, `client.getRoute(...)`)                                                |
| `DatabaseSeeder` calling seeders                     | `database/seeders/main/database_seeder.ts` awaiting plain functions from `database/seeders/{group}/`                                                                                      |
| Pest                                                 | Japa — suites declared in `adonisrc.ts`, files under `tests/{unit,functional,browser}/`                                                                                                   |
| Pint                                                 | Prettier + ESLint (`npm run lint` reports both, `npm run format` writes)                                                                                                                  |
| `tinker` / `route:list` / `key:generate`             | `node ace repl` / `node ace list:routes` / `node ace generate:key`                                                                                                                        |
| `composer require x` + publish config                | `npm i x` then `node ace configure x`, or `node ace add x` for both (a new dependency — ask first)                                                                                        |

## 2. Commands

| Purpose                                    | Command                                                                                                                                        |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Dev server with hot reload                 | `npm run dev` — keep it running: it also regenerates `.adonisjs/` (controller index, Tuyau route registry, page types) whenever you add a file |
| Regenerate `.adonisjs/` without the server | `node ace codegen` (CI runs it before typechecking, since `.adonisjs/` is not committed)                                                       |
| New migration                              | `node ace make:migration assets`                                                                                                               |
| Run / undo migrations                      | `node ace migration:run` · `migration:rollback` · `migration:status` · `migration:fresh` (drops everything)                                    |
| Seed                                       | `node ace db:seed` — runs only `database/seeders/main/` (`seeders.paths` in [config/database.ts](../config/database.ts))                       |
| Checks before finishing                    | `npm run format` · `npm run lint` · `npm run typecheck` · `npm test`                                                                           |

**Never edit by hand:** `.adonisjs/**` and `database/schema.ts`. `migration:run` rewrites `schema.ts` from the migrated tables; change a generated column type through [database/schema_rules.ts](../database/schema_rules.ts), or run `node ace schema:generate` to rebuild it.

## 3. Generators vs writing the file yourself

`make:controller`, `make:validator`, `make:middleware`, `make:service`, `make:transformer`, `make:exception`, `make:test`, `make:model`, `make:migration`, `make:seeder`, `make:factory` exist. They write to the framework's default folders (`app/models`, `app/services`) and know nothing about a domain layout. Use them once to see what a file looks like, then write the real one by hand where it belongs. Only the migration generator is worth using every time — it stamps the timestamp prefix in the filename.

Writing a file by hand means: create it, `export default class …`, and register it where the framework needs to know about it:

| You created                                                 | Register it in                                                                                  |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| a controller                                                | a route file, through `actions` (§5)                                                            |
| a named middleware                                          | `router.named({...})` in `start/kernel.ts`                                                      |
| a new top-level folder you want to import with `#alias/...` | `"imports"` in `package.json` (a top-level folder — ask first)                                  |
| an env var                                                  | `start/env.ts` **and** `.env.example` (a `VITE_*` one also in `inertia/types/global.d.ts`, §12) |
| a provider                                                  | `providers` in `adonisrc.ts`                                                                    |
| a seeder                                                    | an `await` in `database/seeders/main/database_seeder.ts`                                        |

## 4. What happens to a request here

1. `server.use` middleware: container bindings, static files, CORS, Vite, Inertia.
2. The router matches a route (no match → 404 through the exception handler).
3. `router.use` middleware: body parser, session, shield (CSRF), `initialize_auth` (creates `ctx.auth`), `silent_auth` (runs `auth.check()` so `ctx.auth.user` is filled when a session exists, and copies the user's permission codes into a session restored by the remember-me cookie — it never rejects).
4. Named middleware attached to the route or its group: `auth` / `guest` on page routes, `apiAuth` on `/api` groups, `access` per route.
5. The controller method, receiving `HttpContext` — `{ request, response, auth, session, inertia, params, serialize }`.
6. Anything thrown from 1–5 lands in `app/exceptions/handler.ts`, which turns it into the response.

**What the handler answers.** Controllers have no `try/catch`; the handler maps every error.

| Request                                 | Validation error                                                 | Other error                                                                                |
| --------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `/api/*`, or `Accept: application/json` | 422 `{ message, errors: { field: [msg, …] } }` (Laravel's shape) | its status with `{ message }`; a 5xx message becomes "Internal server error" in production |
| An Inertia page or form                 | errors flashed, redirect back; the page reads `errors`           | 404 → `errors/not_found`, 5xx → `errors/server_error` (status pages)                       |

A business rule throws `new Exception('Asset is still assigned to a user', { status: 409 })`; the handler gives it the right shape for either caller. A `try/catch` is only for translating an error (Postgres `23505` → "Code already exists") and always rethrows: swallowing an error inside `db.transaction` commits the partial writes.

## 5. Routes split per file, traceable to the controller

An ES `import` runs once, before any code, so the Laravel trick of `require` inside a group closure does not exist. Instead each route file **exports a named function** (`export function userRoutes()`), and the parent calls it inside its group; whatever the function registers inherits the group's prefix, name prefix and middleware.

```
start/
  routes/
    index.ts                   # entry, preloaded — calls apiRoutes() and webRoutes()
    web/index.ts               # .as('web'): auth routes, then the logged-in group (home, modules)
    web/auth.ts                # login, logout
    web/system/user.ts         # page routes of one module
    api/index.ts               # .prefix('api').as('api'): one group per domain group, each with apiAuth
    api/system/user.ts         # JSON routes of one module
```

The entry moved from the starter's `start/routes.ts`; the preload in [adonisrc.ts](../adonisrc.ts) is `() => import('#start/routes/index')`. The suffix `/index` has to be written out: `#start/*` maps to `./start/*.js`, and Node's subpath imports never add `index.js` to a folder.

```ts
// start/routes/web/index.ts
export function webRoutes() {
  router
    .group(() => {
      authRoutes()

      router
        .group(() => {
          router.on('/').renderInertia('home', {}).as('home')

          router.group(() => userRoutes()).as('system') // web.system.user.*
        })
        .use(middleware.auth())
    })
    .as('web')
}
```

```ts
// start/routes/api/system/user.ts
const module = 'user'

export function userRoutes() {
  router
    .group(() => {
      router
        .get('/', actions.system.User.index)
        .use(middleware.access({ permission: permission.userView }))
        .as('index')

      router
        .post('/', actions.system.User.store)
        .use(middleware.access({ permission: permission.userCreate }))
        .as('store')
      // show, update, delete, …
    })
    .prefix(module)
    .as(module)
    .where('id', router.matchers.number())
}
```

`router.resource()` exists (Laravel's `Route::resource`) but hides the individual routes, which is where the per-route `access` middleware goes.

### Import paths: `#alias`, never `./file.ts`

VS Code's auto-import writes `./file.ts` here, which `npm run typecheck` rejects with TS5097. Preferring non-relative paths makes it write `#start/routes/api/system/user`, the same form as every other import. Put this in your VS Code settings (`.vscode/` is gitignored):

```json
"js/ts.preferences.importModuleSpecifier": "non-relative"
```

Every alias, backend and frontend (`#inertia/*`), is declared once in `package.json` `imports`. Sorted imports order by ASCII, so `#…` aliases come first, then `@scope/…`, then bare packages.

### `actions`: the controller method as a clickable handler

The dev server writes every controller into `.adonisjs/server/controllers.ts` (`controllers.auth.Session`, `controllers.system.User`, …). [app/library/helpers/route.ts](../app/library/helpers/route.ts) wraps that index so each controller exposes its methods as ready-made route handlers: `actions.system.User.store` is the `[lazyImport, 'store']` tuple the router expects. A controller in a subfolder follows the folder, and a new controller shows up in `actions` as soon as the dev server has indexed it. The import stays lazy, which is what lets `--hmr` reload a controller without restarting the server.

| You ctrl+click      | `[controllers.User, 'store']` (starter) | `actions.system.User.store`              |
| ------------------- | --------------------------------------- | ---------------------------------------- |
| the controller      | `.adonisjs/server/controllers.ts`       | `.adonisjs/server/controllers.ts`        |
| the method          | nothing — a string                      | **the `store` method in the controller** |
| a misspelled method | type error                              | type error                               |

So no `FUNC_*` constants are needed: the method is both type-checked and clickable.

### Names that line up

Neither a route name nor a page name is clickable, so traceability comes from the names themselves. If a name spells out where its code lives, finding the code is Ctrl+P, not a search:

```
GET /user/:id                                     (the URL carries the module, not the group)
  route    web.system.user.edit                   ← urlFor('web.system.user.edit', …)
  handler  actions.system.User.edit               → app/controllers/system/user_controller.ts, edit()
  page     inertia.render('system/user/edit')     → inertia/pages/system/user/edit.tsx

PUT /api/user/:id
  route    api.system.user.update                 ← new UserAxios().baseUpdate(id, body)
  handler  actions.system.User.update             → the same controller, update()
```

- **`web.` / `api.` first**, from the outermost group of `web/index.ts` and `api/index.ts`, so one module has `web.system.user.index` and `api.system.user.index` without a collision.
- **The group comes from the parent's `.as('system')`**, the module from the route file's `.as(module)`, and the action from each route's `.as('store')`. Login and logout live inside `web` too: `web.auth.login`, `web.auth.login.submit`, `web.auth.logout.submit`.
- **The page path keeps the group** (`system/user/edit`), the URL does not (`/user/1`). A module name must therefore be unique across groups, or its URLs collide.
- **Pages are named after the method that renders them**: `index`, `create`, `edit`, `show`.

Everything under `inertia/pages/` is indexed as a page and typed from its default export, so a module's private components live in `inertia/components/{group}/{module}/`, never next to the page.

## 6. The domain layer

**A module starts with its migration.** `database/schema.ts` is generated by reading the migrated database, so `AssetSchema` exists only after `migration:run`. Until the first release (`0.1.0`), change a table by `migration:rollback` → edit the same create-table migration → `migration:run`; the typecheck then shows every place that still uses a removed column. After it, every change is a new migration. Table names live in `{module}_constant.ts` (`USER_TABLE = 'users'`), read by the migration, the entity and `pivotTable` options.

```
app/
  controllers/system/user_controller.ts     # talks only to the service
  validators/system/user_validator.ts       # module-level exports
  transformers/system/user_transformer.ts   # output shape (API Resource)
  library/                                  # shared, not a domain group (#library/*)
    helpers/        abilities.ts  object.ts  response_message.ts  route.ts
    mixins/         with_upper_case.ts
    repositories/   base_fetch_repository.ts
    services/       base_service.ts
  domain/
    system/user/                            # sorts in build order:
      user_constant.ts                      #    table name, data only
      user_entity.ts                        # 1. Lucid model (class User)
      user_fetch_repository.ts              # 2. reads
      user_modify_repository.ts             # 3. writes
      user_service.ts                       # 4. the only thing a controller imports
```

Module folders are singular. File names are snake_case like every Adonis file and generator, and start with the module name, so alphabetical order is the order of work.

**Validators are module-level exports** in their own file, never a `const` inside the controller. The Tuyau route scanner finds a validator only through an import; anything else is skipped silently and React loses the typed body. A `unique`/`exists` filter must not return the query builder, so give the arrow braces: `filter: (db) => { db.whereNull('deleted_at') }`.

**The entity** composes the generated schema with mixins:

```ts
// app/domain/system/user/user_entity.ts
export default class User extends compose(UserSchema, SoftDeletes, withAuthFinder(hash)) {
  @belongsTo(() => User, { foreignKey: 'createdById' })
  declare createdBy: BelongsTo<typeof User>

  @manyToMany(() => Role, { pivotTable: USER_ROLE_TABLE, pivotTimestamps: true })
  declare roles: ManyToMany<typeof Role>
}
```

**Reads — the fetch repository** extends [BaseFetchRepository](../app/library/repositories/base_fetch_repository.ts). Every method takes `FetchOptions`, the counterpart of Sequelize's `{ transaction, paranoid: false }`:

```ts
findByEmailOrNull(email: string, options?: FetchOptions<typeof this.model>) {
  return this.query(options).where('email', email).first()
}

// a caller:
await this.fetch.findByEmailOrNull(email, { trx, withTrashed: true })
```

- `query(options)` starts from `Model.query({ client: trx })`, adds `withTrashed()` on request, then the module's `withRelations()` preloads.
- `withTrashed` is typed `never` for a model without `SoftDeletes`, so passing it there is a compile error.
- Preloads skip soft-deleted rows too. Audit relations therefore preload with `.preload('createdBy', (q) => q.withTrashed())`.
- `firstOrNotFound()` throws a 404 naming the table and lookup; `search()` serves select-box options.

**Writes — the modify repository** takes the `trx` from the service. Rows loaded through `{ client: trx }` remember it, so `.save()` and `.related('roles').sync()` stay in the transaction.

```ts
async update(id: number, { authId, roleIds, ...data }: UserUpdate, trx: TransactionClientContract) {
  const existing = await this.fetch.findById(id, { trx })
  await existing.merge({ ...definedOnly(data), updatedById: authId }).save()
  if (roleIds !== undefined) await existing.related('roles').sync(roleIds)
  return this.fetch.findById(id, { trx })
}
```

- **Update semantics:** `undefined` leaves a field unchanged and `null` clears it. `definedOnly()` drops the `undefined` keys, because `merge()` would otherwise assign them.
- **Store restores a soft-deleted row** holding the same unique key (`email`, `code`) instead of inserting: `existing.merge({ ...data, deletedAt: null, … }).save()`. The validator has already refused a key held by a live row.
- **Delete is soft:** `existing.delete()` sets `deleted_at`.
- **Passwords** are saved through the instance, since `withAuthFinder`'s `beforeSave` hook hashes them; a query-builder `update()` skips hooks.

**The service owns the transaction**, and joins a caller's when one is passed in:

```ts
// app/library/services/base_service.ts
protected withTransaction<T>(op: (trx: TransactionClientContract) => Promise<T>, trx?: TransactionClientContract) {
  return trx ? op(trx) : db.transaction(op)
}

// app/domain/system/user/user_service.ts
update(id: number, data: UserUpdate, trx?: TransactionClientContract) {
  return this.withTransaction((trx) => this.userModifyRepository.update(id, data, trx), trx)
}
```

**The controller** validates, calls the service with the acting user's id, and answers the JSON envelope `{ message, data }`:

```ts
@inject()
export default class UserController {
  private module = 'User'

  constructor(private readonly userService: UserService) {}

  async store({ request, response, auth, serialize }: HttpContext) {
    const payload = await request.validateUsing(createUserValidator)
    const user = await this.userService.create({ ...payload, authId: auth.getUserOrFail().id })

    response.status(201)
    return {
      message: responseMessage(this.module).successInsert,
      ...(await serialize(UserTransformer.transform(user))),
    }
  }

  async edit({ params, inertia }: HttpContext) {
    const user = await this.userService.findById(params.id)
    return inertia.render('system/user/edit', { user: UserTransformer.transform(user) })
  }
}
```

**Why `serialize`.** A transformer returns an `Item`, a description of the output, not the JSON itself. `serialize()` resolves it (relations, `whenLoaded`, depth) and wraps it as `{ data: … }`; spreading that next to `message` gives the envelope. Returning the `Item` unserialized would send `{}`. `inertia.render()` resolves transformers in **top-level** props itself, so `edit` passes the `Item` as is. An `Item` nested inside a plain object is not resolved anywhere, which is why `share()` uses `serialize.withoutWrapping(...)` for `auth.user`.

**Nested transformers resolve one level only.** `RoleTransformer.transform(...)` inside `UserTransformer` gives roles without their permissions unless it says `.depth(2)`; the deeper keys are dropped silently.

How it differs from Laravel:

- **Column constants are unnecessary.** `asset.purchasedAt` is typed from the generated schema, the job `ATTR_*` constants did in PHP.
- **Injection is free.** `@inject()` resolves the service and its repositories without `new`; import them as values, never `import type`, or the container has no metadata. Tests can swap a service with `app.container.swap()`.
- **"Controller never touches a model" is enforced** (not built yet): ESLint's `no-restricted-imports`, scoped to `app/controllers/**`, refuses `#domain/**/*_entity`, `#domain/**/*_repository` and `@adonisjs/lucid/services/db`.
- **Codes are uppercase in two layers:** the validator's `.trim().toUpperCase()` runs before `.unique()`, and the `withUpperCase([...])` mixin catches writes that skip the validator.

## 7. How authentication works (vs Sanctum)

**Configuration — [config/auth.ts](../config/auth.ts)**, the counterpart of `config/auth.php`. Two guards:

```ts
web: sessionGuard({
  useRememberMeTokens: true,
  rememberMeTokensAge: '30 days', // not set yet: the default is 2 years
  provider: sessionUserProvider({ model: () => import('#domain/system/user/user_entity') }),
}),
api: tokensGuard({
  provider: tokensUserProvider({ tokens: 'accessTokens', model: () => import('#domain/system/user/user_entity') }),
}),
```

```ts
// app/domain/system/user/user_entity.ts
static rememberMeTokens = DbRememberMeTokensProvider.forModel(User, { table: AUTH_REMEMBER_TOKEN_TABLE })
static accessTokens = DbAccessTokensProvider.forModel(User, { expiresIn: '30 days' })
```

**Remember-me.** The session ends after `age` in [config/session.ts](../config/session.ts) (2 hours idle). With `login(user, remember)` and the "Remember me" box ticked, a long-lived cookie holds a token stored in `auth_remember_tokens`. When the session is gone, the guard verifies that token, logs the user back in, and swaps it for a new one with a fresh expiry. Coming back inside 30 days keeps the user logged in; staying away longer, or logging out, ends it.

**The model.** `withAuthFinder(hash)` adds what `Authenticatable` + the `hashed` cast give in Laravel: the password is hashed in a `beforeSave` hook, and `User.verifyCredentials(email, password)` finds the user and checks the password (throwing `E_INVALID_CREDENTIALS`) with timing-attack protection.

| Laravel                            | Adonis                                                                                                            |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `$request->user()`                 | `auth.user` (`User \| undefined`) or `auth.getUserOrFail()` (`User`)                                              |
| `Auth::attempt([...])`             | `const user = await userService.validateUser(email, password)` then `await auth.use('web').login(user, remember)` |
| `Auth::logout()`                   | `await auth.use('web').logout()`                                                                                  |
| `->middleware('auth')` / `'guest'` | `.use(middleware.auth())` / `.use(middleware.guest())`                                                            |
| `->middleware('access:user-view')` | `.use(middleware.access({ permission: permission.userView }))`                                                    |

**Permissions are read from what login wrote, never from the database per request.** So one `access` middleware serves both guards:

|             | Session (`web`)                                                                                                               | Access token (`api`)                                          |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Written by  | `SessionController.store`, after `login()`: `session.put(ABILITIES_SESSION_KEY, codes)`                                       | `POST /api/login` (not built yet), as the token's `abilities` |
| Restored by | `silent_auth`, once, for a session the remember-me cookie restored                                                            | —                                                             |
| Removed by  | `SessionController.destroy`: `session.forget(ABILITIES_SESSION_KEY)`                                                          | the token expiring or being deleted                           |
| Read by     | `abilitiesOf(ctx)` in [app/library/helpers/abilities.ts](../app/library/helpers/abilities.ts), used by `access` and `share()` | the same                                                      |

The codes come from `UserService.permissionCodes(userId)`: the distinct permission codes across the user's live roles. The trade-off: a change to a user's roles reaches them at their next login. A missing permission answers 403, not 401 — the caller is authenticated, they just lack it.

**Where Sanctum fits.** Its SPA mode (cookie) is the `web` guard: the React app is served on the same origin, and shield's `XSRF-TOKEN` cookie is sent back by axios as `X-XSRF-TOKEN` by itself. Its token mode is the `api` guard. `auth:sanctum` accepts either, and the obvious counterpart is `middleware.auth({ guards: ['web', 'api'] })`. **Do not use that on `/api` here** — §11 explains why, and what `apiAuth` does instead.

## 8. One module end to end — checklist

1. `node ace make:migration assets` → fill in the columns (table name from `{module}_constant.ts`) → `node ace migration:run` → confirm `AssetSchema` appeared in `database/schema.ts`.
2. Permission codes in [permission_constant.ts](../app/domain/system/permission/permission_constant.ts) (`assetView: 'M.0.1'`, …). The seeder gives every code to `ADMIN` by itself; `db:seed` writes the rows.
3. Entity, fetch repository, modify repository, service in `app/domain/{group}/{module}/` (§6).
4. Validator in `app/validators/{group}/{module}_validator.ts`; transformer in `app/transformers/{group}/{module}_transformer.ts`.
5. Controller in `app/controllers/{group}/{module}_controller.ts`, talking only to the service.
6. Route files: `start/routes/api/{group}/{module}.ts` (JSON, `access` per route) and `start/routes/web/{group}/{module}.ts` (pages), each called from its `index.ts`. `node ace list:routes` to check.
7. Pages in `inertia/pages/{group}/{module}/`, an axios class in `inertia/library/axios/{group}/{module}_axios.ts`, and the menu entry in `side_menu_constant.tsx` (§12).
8. Functional test in `tests/functional/{group}/{module}.spec.ts` when the module is a core business flow.
9. `npm run format`, `npm run lint`, `npm run typecheck`, `npm test`.

## 9. Switching from SQLite to PostgreSQL

Done 2026-10-07. Kept for the steps, in case another project needs them. Development and tests use two databases on the same server.

1. **A server.** Containers on this laptop run under Podman, and a published port is **not** reachable on `localhost` from Windows — use the WSL VM's address, which can change after a restart:

   ```sh
   podman run -d --name adonis-react-pg -e POSTGRES_USER=adonis -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=adonis_react -p 5432:5432 docker.io/library/postgres:17
   podman exec adonis-react-pg createdb -U adonis adonis_react_test
   podman machine ssh "ip -4 -o addr show eth0"   # this IP is DB_HOST
   ```

2. **The driver:** `npm i pg` (Knex, under Lucid, loads it by name).
3. **Declare the variables** in [start/env.ts](../start/env.ts) — Adonis refuses to boot when a declared variable is missing, which is the point.
4. **Give them values** in `.env` (real values), `.env.example` (same keys, no secrets), and `.env.test` — only `DB_DATABASE=adonis_react_test` there, since it overrides `.env` when `npm test` runs.
5. **The connection** in [config/database.ts](../config/database.ts): `connection: 'pg'` and the `pg` block reading `env`.
6. `node ace migration:run`, then look at `database/schema.ts`: it is regenerated from PostgreSQL's column types.
7. When a Podman restart changes the VM's IP, only `DB_HOST` in `.env` changes.

## 10. Using a backend constant in React

Permission codes are defined once, on the backend, and React imports the same object, so nobody writes a code as a string:

```ts
// app/domain/system/permission/permission_constant.ts — data only, no server imports
export const permission = {
  userView: 'S.0.1', // DB row: code 'S.0.1', name 'user-view' (seeder: string.dashCase(key))
  userCreate: 'S.0.2',
} as const

export type PermissionSlug = (typeof permission)[keyof typeof permission]
```

```tsx
// any React file
import { permission } from '#domain/system/permission/permission_constant'

const { can } = useAccess()
{
  can(permission.userCreate) && <Button>Add</Button>
}
```

- **TypeScript.** Both typecheck programs (the backend's and `inertia/tsconfig.json`) resolve `#domain/*` from a React file. `permission.userVeiw` is a type error, and ctrl+click lands on the constant.
- **Vite** resolves `#…` imports from `package.json` `imports` to the `.ts` source, so the browser bundle gets the real object.
- **ESLint** refuses a value import from backend code in `inertia/` (`@adonisjs/no-backend-import-in-frontend`). Constant files are let through once in [eslint.config.js](../eslint.config.js) (**not built yet**):

  ```js
  export default configApp(...react, {
    rules: {
      '@adonisjs/no-backend-import-in-frontend': ['error', { allowed: ['#domain/**/*_constant'] }],
    },
  })
  ```

**The file ends up in the browser bundle**, and so does everything it imports. So every `*_constant.ts` stays plain data. One `import db from …` or `import env from …` in it would pull server code into the browser build, or break it.

## 11. `/api` for the panel and for external clients

Every JSON route is in `start/routes/api/` (prefix `/api`, names `api.*`). Each group says whether callers outside the panel may use it:

|                        | Panel only (`system`)                                     | Panel + external clients (`master`)                                                       |
| ---------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Caller                 | the React panel in the browser                            | the panel, and other apps (server, mobile, script)                                        |
| Credential             | session cookie from `/login`                              | session cookie, or `Authorization: Bearer <token>` from `POST /api/login` (valid 30 days) |
| Guard                  | `web`                                                     | no Bearer → `web`; Bearer → `api` **only**                                                |
| A Bearer request       | 401                                                       | authenticated by the token                                                                |
| CSRF                   | always checked (axios sends the `XSRF-TOKEN` cookie back) | checked for cookie requests, skipped for Bearer requests                                  |
| Permissions (`access`) | the session's codes                                       | the session's codes, or the token's abilities                                             |
| Changing the contract  | free: the panel deploys with it                           | careful: external clients do not redeploy with you                                        |

Response shape, error format and camelCase fields are identical in both.

```ts
// start/routes/api/index.ts
export function apiRoutes() {
  router
    .group(() => {
      // router.post('login', …)   not built yet: public, rate-limited, CSRF-exempt

      router
        .group(() => userRoutes())
        .as('system')
        .use(middleware.apiAuth({ external: false })) // panel only

      // router.group(() => assetRoutes())
      //   .as('master')
      //   .use(middleware.apiAuth({ external: true })) // panel + external
    })
    .prefix('api')
    .as('api')
}
```

What [apiAuth](../app/middleware/api_auth_middleware.ts) does, and why each rule is there:

1. **Bearer present.** With `external: false` it answers 401. With `external: true` it authenticates with the `api` guard and nothing else. If the token fails, the request fails; it does not fall back to the session cookie.
2. **No Bearer.** It authenticates with the `web` guard, the panel's session.
3. **`config/shield.ts`** (not built yet) gets `exceptRoutes: (ctx) => …` returning true only for `POST /api/login`, or for a path under `/api/` with a Bearer header. The installed shield accepts a function there.

**Authenticate through `ctx.auth.authenticateUsing([...])`, not `ctx.auth.use('api').authenticate()`.** `ctx.auth.user` returns the user of the last guard the _authenticator_ attempted, and `silent_auth` has already attempted `web` on every request. So after `use('api').authenticate()`, `ctx.auth.user` would still be the session's user.

**Why not `middleware.auth({ guards: ['web', 'api'] })`.** `authenticateUsing` tries the guards in order and takes the first whose `check()` passes:

| Request                                                                                                           | `auth({ guards: ['web', 'api'] })`   | `apiAuth({ external: true })` |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ----------------------------- |
| Session cookie, no Bearer                                                                                         | session user                         | session user                  |
| Valid Bearer, no cookie                                                                                           | token user                           | token user                    |
| **Bogus Bearer + a logged-in Admin's cookie**, sent by another site; CSRF is skipped because of the Bearer header | **session user: the attack works**   | 401                           |
| Valid Bearer + a cookie of a different user                                                                       | the cookie's user (first guard wins) | the token's user              |
| Nothing                                                                                                           | 401                                  | 401                           |

Reversing the order to `['api', 'web']` does not help: the bogus token fails, and the session is next in line. Rules 1 and 3 only work together: a request that skips CSRF must never be accepted on its session cookie. `config/cors.ts` allows any origin with credentials in development, which makes this reachable.

## 12. The React side

The panel is antd v6 + `sti-antd-package` + Tailwind, rendered through Inertia, and behaves as an SPA: `<Link>`, `router.visit()` and `<Form>` swap the page component without a full reload.

```
inertia/
  app.tsx                 # createInertiaApp: page resolver, default layout
  application.tsx         # wraps every page: antd ConfigProvider (theme, locale) and antd App
  client.ts               # Tuyau client: client.getRoute(), urlFor()
  layouts/                main_layout.tsx  auth_layout.tsx
  pages/{group}/{module}/ index.tsx  create.tsx  edit.tsx  show.tsx
  components/             shared (flash_toaster.tsx); a module's own in components/{group}/{module}/
  library/
    axios/                connect_axios.ts  base_axios.ts  {group}/{module}_axios.ts
    constants/            env_constant.ts  side_menu_constant.tsx
    helpers/              plain functions
    hooks/                use_access.ts  use_side_menus.ts
  types/                  global.d.ts (ImportMetaEnv), types.ts (shared-props typing)
```

Files are snake_case, exported components PascalCase (`main_layout.tsx` → `MainLayout`), as on the backend. Imports use `#inertia/…`.

### Layouts

`resolvePageComponent`'s third argument in `app.tsx` is the default layout, `MainLayout`. A page that needs another one sets its own, which wins:

```tsx
Login.layout = (page: ReactElement<Data.SharedProps>) => <AuthLayout>{page}</AuthLayout>
```

A layout reads the shared props from its child, `children.props.auth.user`. Every layout renders `<FlashToaster />`, which shows `flash.success` / `flash.error` as toasts.

### How a page gets typed data

| Data                   | Sent by                                                                         | Typed in React as                                         |
| ---------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Shared with every page | `share()` in `inertia_middleware.ts`: `errors`, `auth.user`, `auth.permissions` | `usePage().props.auth` (through `inertia/types/types.ts`) |
| One page's props       | `inertia.render('system/user/edit', { user: UserTransformer.transform(user) })` | `Data.System.User`, generated from the transformer        |
| A JSON response        | the controller's `{ message, ...serialize(...) }`                               | the axios class's return type, from the Tuyau registry    |

The page path and its props are both checked: a misspelled page in `inertia.render()` is a type error, and so is a prop the component does not declare. Shared props go under `auth` so they never collide with a page prop of the same name (`user` on the user edit page). No frontend model classes: the transformer is the single definition of the shape.

### Reads through props, writes through axios

A page gets its initial data as Inertia props. List tables (`sti-antd-package`) and every create, update and delete go to `/api` through axios and an antd `Form`. Only login and logout use Inertia's `<Form>`, because they change the session and redirect.

Each module has one axios class. The base class carries the CRUD calls, typed from the module's routes (**not built yet**: proposed 2026-10-16, verified in a copy of the project):

```ts
// inertia/library/axios/system/user_axios.ts
export default class UserAxios extends BaseAxios {
  readonly resource = 'api.system.user'

  changePassword(id: number, password: string) {
    return this.request('api.system.user.changePassword', { params: { id }, body: { password } })
  }
}
```

```ts
const userAxios = new UserAxios()
const { data } = await userAxios.baseStore({ firstName, email, password }) // body checked against createUserValidator
data.data.email // typed from UserController.store
```

- `resource` is the route-name prefix; `readonly` keeps its literal type, which is what lets `baseStore`, `baseUpdate`, `baseShow` and `baseDelete` look up `api.system.user.store` and friends. A prefix with no such module, or a body field the validator does not know, is a type error.
- A method beyond CRUD calls `this.request(routeName, { params, body, query })`, which gets the URL and method from `client.getRoute()`.
- No `baseURL`: the panel and `/api` share the origin, so the URL from Tuyau is already right.

**Who handles which error:**

| Status          | Handled by                                                                         |
| --------------- | ---------------------------------------------------------------------------------- |
| 401             | the interceptor in `connect_axios.ts`: a modal, then the login page                |
| 403, 413, 5xx   | the interceptor: a modal with `message`                                            |
| 422             | the caller: one helper maps `errors: { field: [msg] }` onto the antd form's fields |
| other 4xx (409) | the caller: shows `message`                                                        |

### Menu and permission checks

**Not built yet** (proposed 2026-10-16, verified in a copy of the project: typecheck and lint pass).

`side_menu_constant.tsx` is the one source of truth for the side menu, as in task-list. Each item carries its `permission` and its `path` from `urlFor()`:

```tsx
export const sideMenus: SideMenu[] = [
  { key: 'home', label: 'Home', path: urlFor('web.home') },
  {
    key: 'system',
    label: 'System',
    children: [
      {
        key: 'system-user',
        label: 'User',
        permission: permission.userView,
        path: urlFor('web.system.user.index'),
      },
    ],
  },
]
```

`useSideMenus()` drops the items the user may not see, and a parent left without children; `useAccess().can(code)` answers the same question for a button. Both read `auth.permissions`. Hiding is presentation only; the `access` route middleware is what enforces.

### antd, Lucide and Tailwind together

**Not built yet** (decided 2026-10-16; the boundaries are a recommendation).

| Library                 | Its job                                                                                                              | Not its job                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| antd                    | components and their behaviour (Form, Table, Modal, Menu, …)                                                         | page layout                                                                       |
| Lucide (`lucide-react`) | every icon, also inside antd (`icon={<Plus size="1em" />}`, so it follows antd's font size)                          | —                                                                                 |
| Tailwind                | layout, spacing and colour of the page's own elements, and an antd component's outer box (`className="w-full mt-4"`) | an antd component's internals: change those through `ConfigProvider` theme tokens |

**Cascade layers decide who wins.** antd injects its CSS at runtime; Tailwind v4 puts its CSS in layers, and an unlayered rule always beats a layered one. So antd goes into a layer of its own, between Tailwind's reset and its utilities:

```css
/* inertia/assets/css/app.css */
@layer theme, base, antd, components, utilities;
@import 'tailwindcss';

@theme inline {
  --color-primary: var(--ant-color-primary);
  --color-success: var(--ant-color-success);
  --color-warning: var(--ant-color-warning);
  --color-error: var(--ant-color-error);
}
```

```tsx
// inertia/application.tsx
import enUS from 'antd/locale/en_US' // the app-wide locale; `antd/es/*/locale/en_US` is one component's

<StyleProvider layer>
  <ConfigProvider locale={enUS} theme={{ token: { colorPrimary: '#1677ff' } }}>
    <AntApp>
      <App {...props} />
    </AntApp>
  </ConfigProvider>
</StyleProvider>
```

- Tailwind's preflight (`base`) can no longer flatten antd's buttons, and a utility class on an antd component still wins over antd.
- **Colours are defined once, as antd tokens.** antd derives hover and active shades from them in JavaScript, so the source has to be the token, not a CSS value. Tailwind reads the resulting `--ant-*` variables, so `bg-primary` and an antd primary button always match, dark mode included. `@theme inline` keeps the `var()` in the utility instead of resolving it once.
- antd v6 declares those variables on each component's root and on antd `App`'s `div`. That `div` wraps every page, which is what makes them visible to plain elements.
- No other global CSS: an unlayered rule such as the starter's `button { … }` would beat antd and Tailwind both.

### Environment variables

Only variables prefixed `VITE_` reach React, as `import.meta.env.VITE_APP_NAME`, and each is declared in `inertia/types/global.d.ts` (`strictImportMetaEnv` turns an undeclared one into a type error). **They are written into the JavaScript bundle at build time**, from the `.env` of the machine that runs the build: anyone who opens the app can read them, so never put a secret in one. Vite also provides `import.meta.env.MODE`, `DEV` and `PROD` without any variable.

### SSR

Off (`config/inertia.ts`): the panel sits behind a login and needs no search-engine indexing.
