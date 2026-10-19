import { USER_TABLE } from '#domain/system/user/user_constant'
import { USER_ROLE_TABLE } from '#domain/system/user_role/user_role_constant'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = USER_ROLE_TABLE

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
        .integer('user_id')
        .notNullable()
        .unsigned()
        .references(`${USER_TABLE}.id`)
        .onDelete('RESTRICT')
      table.integer('role_id').notNullable().unsigned().references('roles.id').onDelete('RESTRICT')

      table
        .integer('created_by_id')
        .nullable()
        .unsigned()
        .references(`${USER_TABLE}.id`)
        .onDelete('RESTRICT')
      table.timestamps(true, true)

      table.unique(['user_id', 'role_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
