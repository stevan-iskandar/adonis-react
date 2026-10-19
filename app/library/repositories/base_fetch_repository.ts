import { Exception } from '@adonisjs/core/exceptions'
import string from '@adonisjs/core/helpers/string'
import { type TransactionClientContract } from '@adonisjs/lucid/types/database'
import type { LucidModel, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import '@codenameryuu/adonis-lucid-soft-deletes/types/querybuilder'

type SchemaModel = LucidModel & { $columns: readonly string[] }

/**
 * A model composed with `SoftDeletes`, recognised by the static method the
 * mixin adds.
 */
type SoftDeletable = { withTrashed(): unknown }

/**
 * What a caller may add to any read, the way Sequelize takes
 * `{ transaction, paranoid }`. `withTrashed` only exists for soft-deletable
 * models, so passing it to any other repository is a type error.
 */
export type FetchOptions<Model extends LucidModel> = {
  trx?: TransactionClientContract
} & (Model extends SoftDeletable ? { withTrashed?: boolean } : { withTrashed?: never })

/**
 * Shared reads for a module's fetch repository. A subclass names its model and,
 * optionally, the relations every read preloads.
 */
export default abstract class BaseFetchRepository<Model extends SchemaModel> {
  protected abstract model: Model

  /**
   * Relations preloaded by every query from `query()`. Override per module.
   */
  protected withRelations(query: ModelQueryBuilderContract<Model>) {
    return query
  }

  protected query(options?: FetchOptions<Model>) {
    const query = this.model.query({ client: options?.trx })
    if (options?.withTrashed) query.withTrashed()
    return this.withRelations(query)
  }

  /**
   * Options for a select box: `term` matched with ILIKE across `columns`.
   */
  protected search(columns: Model['$columns'][number][], term?: string, limit = 20) {
    const query = this.query().orderBy('id', 'desc').limit(limit)
    if (term)
      query.where((sub) => columns.forEach((column) => sub.orWhereILike(column, `%${term}%`)))
    return query
  }

  /**
   * `first()` that throws a 404 naming the table and the lookup, instead of
   * Lucid's generic "Row not found".
   */
  protected async firstOrNotFound(query: ModelQueryBuilderContract<Model>, lookup: string) {
    const row = await query.first()
    if (!row) {
      const table = this.model.table
      throw new Exception(`Can't find ${string.singular(table)} with ${lookup} at table ${table}`, {
        status: 404,
      })
    }
    return row
  }
}
