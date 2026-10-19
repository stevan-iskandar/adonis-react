import Role from '#domain/system/role/role_entity'
import BaseFetchRepository, { type FetchOptions } from '#library/repositories/base_fetch_repository'
import { type ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

export default class RoleFetchRepository extends BaseFetchRepository<typeof Role> {
  protected model = Role

  protected withRelations(query: ModelQueryBuilderContract<typeof Role>) {
    return query.preload('permissions').preload('users').preload('createdBy').preload('updatedBy')
  }

  options(term?: string) {
    return this.search(['code', 'name'], term)
  }

  findByIdOrNull(id: number, options?: FetchOptions<typeof this.model>) {
    return this.query(options).where('id', id).first()
  }

  findById(id: number, options?: FetchOptions<typeof this.model>) {
    return this.firstOrNotFound(this.query(options).where('id', id), `id '${id}'`)
  }
}
