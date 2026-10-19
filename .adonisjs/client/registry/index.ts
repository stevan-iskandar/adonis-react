/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'api.system.user.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/user',
    tokens: [{"old":"/api/user","type":0,"val":"api","end":""},{"old":"/api/user","type":0,"val":"user","end":""}],
    types: placeholder as Registry['api.system.user.index']['types'],
  },
  'api.system.user.options': {
    methods: ["GET","HEAD"],
    pattern: '/api/user/options',
    tokens: [{"old":"/api/user/options","type":0,"val":"api","end":""},{"old":"/api/user/options","type":0,"val":"user","end":""},{"old":"/api/user/options","type":0,"val":"options","end":""}],
    types: placeholder as Registry['api.system.user.options']['types'],
  },
  'api.system.user.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/user/:id',
    tokens: [{"old":"/api/user/:id","type":0,"val":"api","end":""},{"old":"/api/user/:id","type":0,"val":"user","end":""},{"old":"/api/user/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['api.system.user.show']['types'],
  },
  'api.system.user.store': {
    methods: ["POST"],
    pattern: '/api/user',
    tokens: [{"old":"/api/user","type":0,"val":"api","end":""},{"old":"/api/user","type":0,"val":"user","end":""}],
    types: placeholder as Registry['api.system.user.store']['types'],
  },
  'api.system.user.update': {
    methods: ["PUT"],
    pattern: '/api/user/:id',
    tokens: [{"old":"/api/user/:id","type":0,"val":"api","end":""},{"old":"/api/user/:id","type":0,"val":"user","end":""},{"old":"/api/user/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['api.system.user.update']['types'],
  },
  'api.system.user.changePassword': {
    methods: ["PUT"],
    pattern: '/api/user/:id/change-password',
    tokens: [{"old":"/api/user/:id/change-password","type":0,"val":"api","end":""},{"old":"/api/user/:id/change-password","type":0,"val":"user","end":""},{"old":"/api/user/:id/change-password","type":1,"val":"id","end":""},{"old":"/api/user/:id/change-password","type":0,"val":"change-password","end":""}],
    types: placeholder as Registry['api.system.user.changePassword']['types'],
  },
  'api.system.user.delete': {
    methods: ["DELETE"],
    pattern: '/api/user/:id',
    tokens: [{"old":"/api/user/:id","type":0,"val":"api","end":""},{"old":"/api/user/:id","type":0,"val":"user","end":""},{"old":"/api/user/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['api.system.user.delete']['types'],
  },
  'web.auth.login': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['web.auth.login']['types'],
  },
  'web.auth.login.submit': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['web.auth.login.submit']['types'],
  },
  'web.auth.logout.submit': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [{"old":"/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['web.auth.logout.submit']['types'],
  },
  'web.home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['web.home']['types'],
  },
  'web.system.user.index': {
    methods: ["GET","HEAD"],
    pattern: '/user',
    tokens: [{"old":"/user","type":0,"val":"user","end":""}],
    types: placeholder as Registry['web.system.user.index']['types'],
  },
  'web.system.user.edit': {
    methods: ["GET","HEAD"],
    pattern: '/user/:id',
    tokens: [{"old":"/user/:id","type":0,"val":"user","end":""},{"old":"/user/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['web.system.user.edit']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
