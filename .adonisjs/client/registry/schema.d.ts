/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'api.system.user.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/user'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system/user_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system/user_controller').default['index']>>>
    }
  }
  'api.system.user.options': {
    methods: ["GET","HEAD"]
    pattern: '/api/user/options'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system/user_controller').default['options']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system/user_controller').default['options']>>>
    }
  }
  'api.system.user.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/user/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system/user_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system/user_controller').default['show']>>>
    }
  }
  'api.system.user.store': {
    methods: ["POST"]
    pattern: '/api/user'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/system/user_validator').createUserValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/system/user_validator').createUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system/user_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system/user_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.system.user.update': {
    methods: ["PUT"]
    pattern: '/api/user/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/system/user_validator').updateUserValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/system/user_validator').updateUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system/user_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system/user_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.system.user.changePassword': {
    methods: ["PUT"]
    pattern: '/api/user/:id/change-password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/system/user_validator').updateUserPasswordValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/system/user_validator').updateUserPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system/user_controller').default['changePassword']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system/user_controller').default['changePassword']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.system.user.delete': {
    methods: ["DELETE"]
    pattern: '/api/user/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system/user_controller').default['delete']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system/user_controller').default['delete']>>>
    }
  }
  'web.auth.login': {
    methods: ["GET","HEAD"]
    pattern: '/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/session_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/session_controller').default['create']>>>
    }
  }
  'web.auth.login.submit': {
    methods: ["POST"]
    pattern: '/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth/session_validator').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth/session_validator').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/session_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/session_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'web.auth.logout.submit': {
    methods: ["POST"]
    pattern: '/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/session_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/session_controller').default['destroy']>>>
    }
  }
  'web.home': {
    methods: ["GET","HEAD"]
    pattern: '/'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'web.system.user.index': {
    methods: ["GET","HEAD"]
    pattern: '/user'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'web.system.user.edit': {
    methods: ["GET","HEAD"]
    pattern: '/user/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/system/user_controller').default['edit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/system/user_controller').default['edit']>>>
    }
  }
}
