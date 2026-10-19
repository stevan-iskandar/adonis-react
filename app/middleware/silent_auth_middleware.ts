import UserService from '#domain/system/user/user_service'
import { ABILITIES_SESSION_KEY } from '#library/helpers/abilities'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Silent auth middleware can be used as a global middleware to silent check
 * if the user is logged-in or not.
 *
 * The request continues as usual, even when the user is not logged-in.
 */
@inject()
export default class SilentAuthMiddleware {
  constructor(private readonly userService: UserService) {}

  async handle(ctx: HttpContext, next: NextFn) {
    await ctx.auth.check()

    /**
     * A session restored from the remember-me cookie never passed through the
     * login controller, so it gets its abilities here, once.
     */
    if (ctx.auth.user && !ctx.session.has(ABILITIES_SESSION_KEY)) {
      const abilities = await this.userService.permissionCodes(ctx.auth.user.id)
      ctx.session.put(ABILITIES_SESSION_KEY, abilities)
    }

    return next()
  }
}
