import { USER_TABLE } from '#domain/system/user/user_constant'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = USER_TABLE

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable().unsigned()

      table.string('first_name').notNullable()
      table.string('last_name').nullable()
      table.string('email').notNullable().unique()
      table.string('password').notNullable()

      table
        .integer('created_by_id')
        .nullable()
        .unsigned()
        .references(`${USER_TABLE}.id`)
        .onDelete('RESTRICT')
      table
        .integer('updated_by_id')
        .nullable()
        .unsigned()
        .references(`${USER_TABLE}.id`)
        .onDelete('RESTRICT')
      table.timestamps(true, true)
      table.timestamp('deleted_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
