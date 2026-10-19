import { UserSchema } from '#database/schema'
import { AUTH_REMEMBER_TOKEN_TABLE } from '#domain/auth/auth_remember_token/auth_remember_token_constant'
import Role from '#domain/system/role/role_entity'
import { USER_ROLE_TABLE } from '#domain/system/user_role/user_role_constant'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbRememberMeTokensProvider } from '@adonisjs/auth/session'
import { compose } from '@adonisjs/core/helpers'
import hash from '@adonisjs/core/services/hash'
import { belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import { SoftDeletes } from '@codenameryuu/adonis-lucid-soft-deletes'

export default class User extends compose(UserSchema, SoftDeletes, withAuthFinder(hash)) {
  static rememberMeTokens = DbRememberMeTokensProvider.forModel(User, {
    table: AUTH_REMEMBER_TOKEN_TABLE,
  })

  static accessTokens = DbAccessTokensProvider.forModel(User, { expiresIn: '30 days' })

  @belongsTo(() => User, { foreignKey: 'createdById' })
  declare createdBy: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'updatedById' })
  declare updatedBy: BelongsTo<typeof User>

  @manyToMany(() => Role, { pivotTable: USER_ROLE_TABLE, pivotTimestamps: true })
  declare roles: ManyToMany<typeof Role>
}
