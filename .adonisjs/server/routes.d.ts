import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'api.system.user.index': { paramsTuple?: []; params?: {} }
    'api.system.user.options': { paramsTuple?: []; params?: {} }
    'api.system.user.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.system.user.store': { paramsTuple?: []; params?: {} }
    'api.system.user.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.system.user.changePassword': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.system.user.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'web.auth.login': { paramsTuple?: []; params?: {} }
    'web.auth.login.submit': { paramsTuple?: []; params?: {} }
    'web.auth.logout.submit': { paramsTuple?: []; params?: {} }
    'web.home': { paramsTuple?: []; params?: {} }
    'web.system.user.index': { paramsTuple?: []; params?: {} }
    'web.system.user.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'api.system.user.index': { paramsTuple?: []; params?: {} }
    'api.system.user.options': { paramsTuple?: []; params?: {} }
    'api.system.user.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'web.auth.login': { paramsTuple?: []; params?: {} }
    'web.home': { paramsTuple?: []; params?: {} }
    'web.system.user.index': { paramsTuple?: []; params?: {} }
    'web.system.user.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'api.system.user.index': { paramsTuple?: []; params?: {} }
    'api.system.user.options': { paramsTuple?: []; params?: {} }
    'api.system.user.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'web.auth.login': { paramsTuple?: []; params?: {} }
    'web.home': { paramsTuple?: []; params?: {} }
    'web.system.user.index': { paramsTuple?: []; params?: {} }
    'web.system.user.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'api.system.user.store': { paramsTuple?: []; params?: {} }
    'web.auth.login.submit': { paramsTuple?: []; params?: {} }
    'web.auth.logout.submit': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'api.system.user.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.system.user.changePassword': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'api.system.user.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}