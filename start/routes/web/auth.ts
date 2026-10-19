import { actions } from '#library/helpers/route'
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

export function authRoutes() {
  router
    .group(() => {
      router
        .group(() => {
          router.get('login', actions.auth.Session.create).as('login')
          router.post('login', actions.auth.Session.store).as('login.submit')
        })
        .use(middleware.guest())

      router.post('logout', actions.auth.Session.destroy).use(middleware.auth()).as('logout.submit')
    })
    .as('auth')
}
