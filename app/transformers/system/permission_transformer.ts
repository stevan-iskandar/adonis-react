import type Permission from '#domain/system/permission/permission_entity'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class PermissionTransformer extends BaseTransformer<Permission> {
  toObject() {
    return this.pick(this.resource, ['id', 'code', 'name'])
  }
}
