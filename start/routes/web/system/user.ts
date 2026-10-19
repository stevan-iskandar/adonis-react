import { actions } from '#library/helpers/route'
import router from '@adonisjs/core/services/router'

const module = 'user'

export function userRoutes() {
  router
    .group(() => {
      router.on('/').renderInertia('system/user/index', {}).as('index')
      router.get(':id', actions.system.User.edit).as('edit')
    })
    .prefix(module)
    .as(module)
    .where('id', router.matchers.number())
}
