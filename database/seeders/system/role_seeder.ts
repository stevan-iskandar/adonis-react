import { permission } from '#domain/system/permission/permission_constant'
import Permission from '#domain/system/permission/permission_entity'
import Role from '#domain/system/role/role_entity'

export default async function roleSeeder() {
  const admin = await Role.updateOrCreate({ code: 'ADMIN' }, { name: 'Admin' })
  const staff = await Role.updateOrCreate({ code: 'STAFF' }, { name: 'Staff' })

  const all = await Permission.all()
  await admin.related('permissions').sync(all.map((p) => p.id))

  const assetCodes: string[] = [
    permission.assetView,
    permission.assetCreate,
    permission.assetEdit,
    permission.assetDelete,
  ]

  const asset = await Permission.query().whereIn('code', assetCodes)
  await staff.related('permissions').sync(asset.map((p) => p.id))
}
