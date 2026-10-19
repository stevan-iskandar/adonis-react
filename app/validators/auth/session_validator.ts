import vine from '@vinejs/vine'

/**
 * Validator to use when logging in an existing user
 */
export const loginValidator = vine.create({
  email: vine.string().email().maxLength(255),
  password: vine.string(),
  remember: vine.boolean().optional(),
})
