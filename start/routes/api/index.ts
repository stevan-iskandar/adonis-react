import { middleware } from '#start/kernel'
import { userRoutes } from '#start/routes/api/system/user'
import router from '@adonisjs/core/services/router'

export function apiRoutes() {
  router
    .group(() => {
      router.group(() => {}).use(middleware.guest())

      router
        .group(() => {
          userRoutes()
        })
        .as('system')
        .use(middleware.apiAuth({ external: false }))
    })
    .prefix('api')
    .as('api')
}
