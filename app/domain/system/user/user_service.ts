import User from '#domain/system/user/user_entity'
import UserFetchRepository from '#domain/system/user/user_fetch_repository'
import UserModifyRepository from '#domain/system/user/user_modify_repository'
import { FetchOptions } from '#library/repositories/base_fetch_repository'
import BaseService from '#library/services/base_service'
import { inject } from '@adonisjs/core'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

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
export default class UserService extends BaseService<typeof User> {
  protected model = User

  constructor(
    private readonly userFetchRepository: UserFetchRepository,
    private readonly userModifyRepository: UserModifyRepository
  ) {
    super()
  }

  // async find(query: DataTableUserDto | SearchUserDto) {
  //   return this.userFetchRepository.find(query)
  // }

  async options(term?: string) {
    return this.userFetchRepository.options(term)
  }

  async findByIdOrNull(id: number, options?: FetchOptions<typeof this.model>) {
    return this.userFetchRepository.findByIdOrNull(id, options)
  }

  async findById(id: number, options?: FetchOptions<typeof this.model>) {
    return this.userFetchRepository.findById(id, options)
  }

  async findByEmailOrNull(email: string, options?: FetchOptions<typeof this.model>) {
    return this.userFetchRepository.findByEmailOrNull(email, options)
  }

  async findByEmail(email: string, options?: FetchOptions<typeof this.model>) {
    return this.userFetchRepository.findByEmail(email, options)
  }

  async permissionCodes(userId: number) {
    return this.userFetchRepository.permissionCodes(userId)
  }

  async create(data: UserStore, trx?: TransactionClientContract) {
    return this.withTransaction(async (trx) => {
      return this.userModifyRepository.store(data, trx)
    }, trx)
  }

  async update(id: number, data: UserUpdate, trx?: TransactionClientContract) {
    return this.withTransaction(async (trx) => {
      return this.userModifyRepository.update(id, data, trx)
    }, trx)
  }

  async delete(id: number, trx?: TransactionClientContract) {
    return this.withTransaction(async (trx) => {
      return this.userModifyRepository.delete(id, trx)
    }, trx)
  }

  /**
   * Self-service edit of the caller's own record. Separate from `update()` so
   * the set of self-editable fields is fixed in one place rather than depending
   * on what a controller happens to pass through.
   */
  async updateProfile(id: number, data: UserProfileUpdate, trx?: TransactionClientContract) {
    return this.withTransaction(async (trx) => {
      return this.userModifyRepository.updateProfile(id, data, trx)
    }, trx)
  }

  /**
   * Replaces the caller's password, given in plaintext — the entity hook
   * hashes it. Verifying the current password belongs to `AuthService`, which
   * owns credential checks; this only writes.
   */
  async changePassword(
    id: number,
    password: string,
    trx?: TransactionClientContract
  ): Promise<void> {
    return this.withTransaction(async (trx) => {
      return this.userModifyRepository.setPassword(id, password, trx)
    }, trx)
  }

  async validateUser(email: string, password: string): Promise<User> {
    return this.model.verifyCredentials(email, password)
  }
}
