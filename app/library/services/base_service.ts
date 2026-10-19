import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { type LucidModel } from '@adonisjs/lucid/types/model'

type SchemaModel = LucidModel & { $columns: readonly string[] }

export default abstract class BaseService<Model extends SchemaModel> {
  protected abstract model: Model

  protected withTransaction<T>(
    op: (trx: TransactionClientContract) => Promise<T>,
    trx?: TransactionClientContract
  ) {
    return trx ? op(trx) : db.transaction(op)
  }
}
