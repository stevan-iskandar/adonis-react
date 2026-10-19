import Role from '#domain/system/role/role_entity'
import User from '#domain/system/user/user_entity'
import env from '#start/env'

export default async function userSeeder() {
  const email = env.get('ADMIN_EMAIL', 'admin@email.com')
  const admin =
    (await User.query().withTrashed().where('email', email).first()) ?? (await createAdmin(email))

  if (admin.deletedAt) await admin.restore()

  const adminRole = await Role.findByOrFail('code', 'ADMIN')
  await admin.related('roles').sync([adminRole.id])
}

function createAdmin(email: string) {
  const password = env.get('ADMIN_PASS')
  if (!password) throw new Error('ADMIN_PASS is required to create the admin user')

  return User.create({ email, firstName: 'Admin', password })
}
