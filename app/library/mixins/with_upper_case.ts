import { beforeSave, type BaseModel } from '@adonisjs/lucid/orm'
import type { NormalizeConstructor } from '@adonisjs/core/types/helpers'

/**
 * Uppercases the given string columns whenever they change, on create and
 * update alike. A factory taking options, the same shape as withAuthFinder.
 */
export function withUpperCase<const Field extends string>(fields: Field[]) {
  return <Model extends NormalizeConstructor<typeof BaseModel>>(
    superclass: Model & (abstract new (...args: any[]) => { [K in Field]: string | null })
  ) => {
    const Base: Model = superclass
    class WithUpperCase extends Base {
      @beforeSave()
      static upperCaseFields(row: WithUpperCase) {
        const record = row as unknown as Record<Field, string | null>
        for (const field of fields) {
          const value = record[field]
          if (row.$dirty[field] && typeof value === 'string') record[field] = value.toUpperCase()
        }
      }
    }
    return WithUpperCase
  }
}
