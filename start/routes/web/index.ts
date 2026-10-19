import { middleware } from '#start/kernel'
import { authRoutes } from '#start/routes/web/auth'
import { userRoutes } from '#start/routes/web/system/user'
import router from '@adonisjs/core/services/router'

export function webRoutes() {
  router
    .group(() => {
      authRoutes()

      router
        .group(() => {
          router.on('/').renderInertia('home', {}).as('home')

          // System
          router
            .group(() => {
              userRoutes()
            })
            .as('system')
        })
        .use(middleware.auth())
    })
    .as('web')
}
