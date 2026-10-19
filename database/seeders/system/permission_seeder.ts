import { permission } from '#domain/system/permission/permission_constant'
import Permission from '#domain/system/permission/permission_entity'
import string from '@adonisjs/core/helpers/string'
import { type ModelAttributes } from '@adonisjs/lucid/types/model'

export default async function permissionSeeder() {
  const permissions: Partial<ModelAttributes<Permission>>[] = Object.entries(permission).map(
    ([key, code]) => ({
      code,
      name: string.dashCase(key),
    })
  )

  await Permission.fetchOrCreateMany('code', permissions)
}
