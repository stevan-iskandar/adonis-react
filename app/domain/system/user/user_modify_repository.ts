import User from '#domain/system/user/user_entity'
import UserFetchRepository from '#domain/system/user/user_fetch_repository'
import { definedOnly } from '#library/helpers/object'
import { inject } from '@adonisjs/core'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

interface UserStore {
  firstName: string
  lastName?: string | null
  email: string
  password: string
  roleIds?: number[]
  authId: number
}

interface UserUpdate {
  firstName?: string
  lastName?: string | null
  email?: string
  password?: string
  roleIds?: number[]
  authId: number
}

interface UserProfileUpdate {
  firstName: string
  lastName?: string | null
}

@inject()
export default class UserModifyRepository {
  protected model = User

  constructor(private readonly fetch: UserFetchRepository) {}

  /**
   * An email held by a soft-deleted user restores that row with the new values
   * instead of inserting, since `email` is unique across deleted rows too. The
   * validator has already refused an email held by a live user.
   */
  async store({ authId, roleIds, ...data }: UserStore, trx: TransactionClientContract) {
    const existing = await this.fetch.findByEmailOrNull(data.email, { trx, withTrashed: true })

    const user = existing
      ? await existing
          .merge({ ...data, deletedAt: null, createdById: authId, updatedById: authId })
          .save()
      : await this.model.create(
          { ...data, createdById: authId, updatedById: authId },
          { client: trx }
        )

    if (roleIds !== undefined) await user.related('roles').sync(roleIds)

    return this.fetch.findById(user.id, { trx })
  }

  async update(
    id: number,
    { authId, roleIds, ...data }: UserUpdate,
    trx: TransactionClientContract
  ) {
    const existing = await this.fetch.findById(id, { trx })

    await existing.merge({ ...definedOnly(data), updatedById: authId }).save()

    if (roleIds !== undefined) await existing.related('roles').sync(roleIds)

    return this.fetch.findById(id, { trx })
  }

  async delete(id: number, trx: TransactionClientContract) {
    const existing = await this.fetch.findById(id, { trx })

    await existing.delete()
  }

  /**
   * Self-service edit: only what a user may change about themselves, with the
   * user as the actor.
   */
  async updateProfile(id: number, data: UserProfileUpdate, trx: TransactionClientContract) {
    const existing = await this.fetch.findById(id, { trx })

    await existing.merge({ ...definedOnly(data), updatedById: id }).save()

    return this.fetch.findById(id, { trx })
  }

  /**
   * Takes the password in plaintext: `withAuthFinder`'s `beforeSave` hook hashes
   * it. Saved through the instance for that reason, because a query-builder
   * `update()` skips model hooks and would store it unhashed.
   */
  async setPassword(id: number, password: string, trx: TransactionClientContract) {
    const existing = await this.fetch.findById(id, { trx })

    await existing.merge({ password, updatedById: id }).save()
  }
}
