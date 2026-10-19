import { RoleSchema } from '#database/schema'
import Permission from '#domain/system/permission/permission_entity'
import { ROLE_PERMISSION_TABLE } from '#domain/system/role_permission/role_permission_constant'
import User from '#domain/system/user/user_entity'
import { USER_ROLE_TABLE } from '#domain/system/user_role/user_role_constant'
import { withUpperCase } from '#library/mixins/with_upper_case'
import { compose } from '@adonisjs/core/helpers'
import { belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import { SoftDeletes } from '@codenameryuu/adonis-lucid-soft-deletes'

export default class Role extends compose(RoleSchema, SoftDeletes, withUpperCase(['code'])) {
  @belongsTo(() => User, { foreignKey: 'createdById' })
  declare createdBy: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'updatedById' })
  declare updatedBy: BelongsTo<typeof User>

  @manyToMany(() => Permission, { pivotTable: ROLE_PERMISSION_TABLE, pivotTimestamps: true })
  declare permissions: ManyToMany<typeof Permission>

  @manyToMany(() => User, { pivotTable: USER_ROLE_TABLE, pivotTimestamps: true })
  declare users: ManyToMany<typeof User>
}
