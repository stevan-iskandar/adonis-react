import { PERMISSION_TABLE } from '#domain/system/permission/permission_constant'
import Permission from '#domain/system/permission/permission_entity'
import { ROLE_TABLE } from '#domain/system/role/role_constant'
import { ROLE_PERMISSION_TABLE } from '#domain/system/role_permission/role_permission_constant'
import User from '#domain/system/user/user_entity'
import { USER_ROLE_TABLE } from '#domain/system/user_role/user_role_constant'
import BaseFetchRepository, { type FetchOptions } from '#library/repositories/base_fetch_repository'
import { type ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

export default class UserFetchRepository extends BaseFetchRepository<typeof User> {
  protected model = User

  protected withRelations(query: ModelQueryBuilderContract<typeof User>) {
    return query
      .preload('roles', (roles) => roles.preload('permissions'))
      .preload('createdBy')
      .preload('updatedBy')
  }

  options(term?: string) {
    return this.search(['firstName', 'lastName', 'email'], term)
  }

  findByIdOrNull(id: number, options?: FetchOptions<typeof this.model>) {
    return this.query(options).where('id', id).first()
  }

  findById(id: number, options?: FetchOptions<typeof this.model>) {
    return this.firstOrNotFound(this.query(options).where('id', id), `id '${id}'`)
  }

  findByEmailOrNull(email: string, options?: FetchOptions<typeof this.model>) {
    return this.query(options).where('email', email).first()
  }

  findByEmail(email: string, options?: FetchOptions<typeof this.model>) {
    return this.firstOrNotFound(this.query(options).where('email', email), `email '${email}'`)
  }

  /**
   * The distinct permission codes across the user's live roles: what login
   * stores in the session and puts in an access token's abilities.
   */
  async permissionCodes(userId: number) {
    const rows = await Permission.query()
      .distinct(`${PERMISSION_TABLE}.code`)
      .join(
        ROLE_PERMISSION_TABLE,
        `${ROLE_PERMISSION_TABLE}.permission_id`,
        `${PERMISSION_TABLE}.id`
      )
      .join(USER_ROLE_TABLE, `${USER_ROLE_TABLE}.role_id`, `${ROLE_PERMISSION_TABLE}.role_id`)
      .join(ROLE_TABLE, `${ROLE_TABLE}.id`, `${USER_ROLE_TABLE}.role_id`)
      .whereNull(`${ROLE_TABLE}.deleted_at`)
      .where(`${USER_ROLE_TABLE}.user_id`, userId)

    return rows.map((row) => row.code)
  }
}
