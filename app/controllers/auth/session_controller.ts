import UserService from '#domain/system/user/user_service'
import { ABILITIES_SESSION_KEY } from '#library/helpers/abilities'
import { loginValidator } from '#validators/auth/session_validator'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class SessionController {
  constructor(private readonly userService: UserService) {}

  async create({ inertia }: HttpContext) {
    return inertia.render('auth/login', {})
  }

  async store({ request, auth, session, response }: HttpContext) {
    const { email, password, remember } = await request.validateUsing(loginValidator)
    const user = await this.userService.validateUser(email, password)

    await auth.use('web').login(user, remember)
    session.put(ABILITIES_SESSION_KEY, await this.userService.permissionCodes(user.id))
    response.redirect().toRoute('web.home')
  }

  async destroy({ auth, session, response }: HttpContext) {
    await auth.use('web').logout()
    session.forget(ABILITIES_SESSION_KEY)
    response.redirect().toRoute('web.auth.login')
  }
}
