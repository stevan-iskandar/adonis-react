import { ROLE_TABLE } from '#domain/system/role/role_constant'
import { USER_TABLE } from '#domain/system/user/user_constant'
import vine from '@vinejs/vine'

/**
 * Shared rules for the user fields.
 */
const name = () => vine.string().trim().maxLength(255)
const email = () => vine.string().trim().email().maxLength(255)
const password = () => vine.string().minLength(8).maxLength(32)
const roleIds = () =>
  vine
    .array(
      vine.number().exists({
        table: ROLE_TABLE,
        column: 'id',
        filter: (db) => {
          db.whereNull('deleted_at')
        },
      })
    )
    .distinct()

/**
 * An email is taken only by a live user. One held by a soft-deleted user is
 * allowed, and the modify repository restores that row.
 */
export const createUserValidator = vine.create({
  firstName: name(),
  lastName: name().nullable().optional(),
  email: email().unique({
    table: USER_TABLE,
    column: 'email',
    filter: (db) => {
      db.whereNull('deleted_at')
    },
  }),
  password: password(),
  roleIds: roleIds().optional(),
})

/**
 * Every field is optional: an absent field is left unchanged.
 */
export const updateUserValidator = vine.withMetaData<{ userId: number }>().create({
  firstName: name().optional(),
  lastName: name().nullable().optional(),
  email: email()
    .unique({
      table: USER_TABLE,
      column: 'email',
      filter: (db, _, field) => {
        db.whereNull('deleted_at').whereNot('id', field.meta.userId)
      },
    })
    .optional(),
  password: password().optional(),
  roleIds: roleIds().optional(),
})

export const updateUserPasswordValidator = vine.create({
  password: password().confirmed({ as: 'passwordConfirmation' }),
})
