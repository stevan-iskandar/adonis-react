import permissionSeeder from '#database/seeders/system/permission_seeder'
import roleSeeder from '#database/seeders/system/role_seeder'
import userSeeder from '#database/seeders/system/user_seeder'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await permissionSeeder()
    await roleSeeder()
    await userSeeder()
  }
}
