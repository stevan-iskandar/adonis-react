import type { HttpContext } from '@adonisjs/core/http'

/**
 * Session key holding the permission codes written at login, the session
 * counterpart of an access token's `abilities`.
 */
export const ABILITIES_SESSION_KEY = 'abilities'

/**
 * The permission codes the request carries: the access token's abilities for
 * the `api` guard, the session's copy for `web`. Neither is re-read from the
 * database, so a change to a user's roles reaches them at their next login.
 */
export function abilitiesOf(ctx: HttpContext): string[] {
  if (ctx.auth.authenticatedViaGuard === 'api') {
    return ctx.auth.use('api').getUserOrFail().currentAccessToken.abilities
  }

  return ctx.session.get(ABILITIES_SESSION_KEY, [])
}
