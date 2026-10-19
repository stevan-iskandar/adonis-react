import { permission } from '#domain/system/permission/permission_constant'
import { actions } from '#library/helpers/route'
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const module = 'user'

export function userRoutes() {
  router
    .group(() => {
      router
        .get('/', actions.system.User.index)
        .use(middleware.access({ permission: permission.userView }))
        .as('index')

      router
        .get('options', actions.system.User.options)
        .use(middleware.access({ permission: permission.userView }))
        .as('options')

      router
        .get(':id', actions.system.User.show)
        .use(middleware.access({ permission: permission.userView }))
        .as('show')

      router
        .post('/', actions.system.User.store)
        .use(middleware.access({ permission: permission.userCreate }))
        .as('store')

      router
        .put(':id', actions.system.User.update)
        .use(middleware.access({ permission: permission.userEdit }))
        .as('update')

      router
        .put(':id/change-password', actions.system.User.changePassword)
        .use(middleware.access({ permission: permission.userEdit }))
        .as('changePassword')

      router
        .delete(':id', actions.system.User.delete)
        .use(middleware.access({ permission: permission.userDelete }))
        .as('delete')
    })
    .prefix(module)
    .as(module)
    .where('id', router.matchers.number())
}
