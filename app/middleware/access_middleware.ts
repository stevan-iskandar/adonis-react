import type { PermissionSlug } from '#domain/system/permission/permission_constant'
import { abilitiesOf } from '#library/helpers/abilities'
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Lets the request through only when the authenticated user holds
 * `permission`, whether they came with a session or an access token. Runs
 * after `auth` / `apiAuth`. Answers 403, not 401: the caller is
 * authenticated, they just lack the permission.
 */
export default class AccessMiddleware {
  async handle(ctx: HttpContext, next: NextFn, options: { permission: PermissionSlug }) {
    if (!abilitiesOf(ctx).includes(options.permission)) {
      throw new Exception('You do not have permission to do this', { status: 403 })
    }

    return next()
  }
}
