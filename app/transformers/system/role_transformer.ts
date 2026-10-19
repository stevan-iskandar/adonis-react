import type Role from '#domain/system/role/role_entity'
import PermissionTransformer from '#transformers/system/permission_transformer'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class RoleTransformer extends BaseTransformer<Role> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'code', 'name']),
      permissions: PermissionTransformer.transform(this.whenLoaded(this.resource.permissions)),
    }
  }
}
