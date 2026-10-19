/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  api: {
    system: {
      user: {
        index: typeof routes['api.system.user.index']
        options: typeof routes['api.system.user.options']
        show: typeof routes['api.system.user.show']
        store: typeof routes['api.system.user.store']
        update: typeof routes['api.system.user.update']
        changePassword: typeof routes['api.system.user.changePassword']
        delete: typeof routes['api.system.user.delete']
      }
    }
  }
  web: {
    auth: {
      login: typeof routes['web.auth.login'] & {
        submit: typeof routes['web.auth.login.submit']
      }
      logout: {
        submit: typeof routes['web.auth.logout.submit']
      }
    }
    home: typeof routes['web.home']
    system: {
      user: {
        index: typeof routes['web.system.user.index']
        edit: typeof routes['web.system.user.edit']
      }
    }
  }
}
