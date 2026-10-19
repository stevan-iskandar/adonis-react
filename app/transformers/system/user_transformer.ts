import type User from '#domain/system/user/user_entity'
import RoleTransformer from '#transformers/system/role_transformer'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class UserTransformer extends BaseTransformer<User> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'firstName',
        'lastName',
        'email',
        'createdById',
        'updatedById',
        'createdAt',
        'updatedAt',
        'deletedAt',
      ]),
      roles: RoleTransformer.transform(this.whenLoaded(this.resource.roles))?.depth(2),
      createdBy: UserTransformer.transform(this.whenLoaded(this.resource.createdBy)),
      updatedBy: UserTransformer.transform(this.whenLoaded(this.resource.updatedBy)),
    }
  }
}
