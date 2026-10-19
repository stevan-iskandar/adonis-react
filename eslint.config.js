import { configApp } from '@adonisjs/eslint-config'
import { react } from '@adonisjs/eslint-config/react'

export default configApp(...react, {
  /**
   * Vite's build output.
   */
  ignores: ['public/assets/**'],
}, {
  rules: {
    /**
     * Constant files are data only, so React may import them as values.
     */
    '@adonisjs/no-backend-import-in-frontend': ['error', { allowed: ['#domain/**/*_constant'] }],
    /**
     * `withTransaction((trx) => …, trx)` names the callback's transaction after
     * the optional one it may be, on purpose.
     */
    '@typescript-eslint/no-shadow': ['error', { allow: ['trx'] }],
  },
})
