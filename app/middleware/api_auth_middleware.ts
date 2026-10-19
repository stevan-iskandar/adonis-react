import { errors } from '@adonisjs/auth'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Authenticates `/api` routes. A `Bearer` header selects the `api` token guard,
 * and only on groups open to external clients; without one the request uses
 * the `web` session guard. See guide §11 for why the guards are never tried
 * one after the other.
 */
export default class ApiAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn, options: { external: boolean }) {
    const bearer = ctx.request.header('authorization', '')!.startsWith('Bearer ')

    if (bearer && !options.external) {
      throw new errors.E_UNAUTHORIZED_ACCESS('Unauthorized access', {
        guardDriverName: 'access_tokens',
      })
    }

    await ctx.auth.authenticateUsing([bearer ? 'api' : 'web'])
    return next()
  }
}
