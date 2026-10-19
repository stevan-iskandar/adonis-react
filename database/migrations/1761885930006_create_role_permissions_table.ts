import { ROLE_PERMISSION_TABLE } from '#domain/system/role_permission/role_permission_constant'
import { USER_TABLE } from '#domain/system/user/user_constant'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = ROLE_PERMISSION_TABLE

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('role_id').notNullable().unsigned().references('roles.id').onDelete('RESTRICT')
      table
        .integer('permission_id')
        .notNullable()
        .unsigned()
        .references('permissions.id')
        .onDelete('RESTRICT')

      table
        .integer('created_by_id')
        .nullable()
        .unsigned()
        .references(`${USER_TABLE}.id`)
        .onDelete('RESTRICT')
      table.timestamps(true, true)

      table.unique(['role_id', 'permission_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
