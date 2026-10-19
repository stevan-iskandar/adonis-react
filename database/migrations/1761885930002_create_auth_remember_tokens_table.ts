import { AUTH_REMEMBER_TOKEN_TABLE } from '#domain/auth/auth_remember_token/auth_remember_token_constant'
import { USER_TABLE } from '#domain/system/user/user_constant'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = AUTH_REMEMBER_TOKEN_TABLE

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('tokenable_id').notNullable().references(`${USER_TABLE}.id`).onDelete('CASCADE')
      table.string('hash').notNullable().unique()
      table.timestamp('expires_at').notNullable()

      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
