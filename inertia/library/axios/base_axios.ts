import { client } from '#inertia/client'
import { connect } from '#inertia/library/axios/connect_axios'
import { type registry } from '@generated/registry'
import type { InferRoutes, RequestArgs, StrKeys } from '@tuyau/core/types'
import { message } from 'antd'
import { type AxiosResponse } from 'axios'
import fileDownload from 'js-file-download'

export type BaseAxiosProps = {
  url?: string
}

type Routes = InferRoutes<typeof registry>
type RouteName = StrKeys<Routes>

export type Resource = {
  [Name in RouteName]: Name extends `api.${infer Rest}.index` ? `api.${Rest}` : never
}[RouteName]

type Endpoint<Name extends string> = Name extends RouteName ? Routes[Name]['types'] : never
type Reply<Name extends string> = Promise<AxiosResponse<Endpoint<Name>['response']>>

const toField = (value: unknown) => (value instanceof Blob ? value : String(value))

export default abstract class BaseAxios {
  abstract readonly resource: Resource

  getBaseURL(): string {
    return ''
  }

  connect() {
    return connect({
      baseURL: this.getBaseURL(),
    })
  }

  request<Name extends StrKeys<Routes>>(name: Name, args: RequestArgs<Routes[Name]>) {
    const { url, methods } = client.getRoute(name, args)
    const { body, query } = args as { body?: unknown; query?: unknown }

    return this.connect().request<Routes[Name]['types']['response']>({
      url,
      method: methods[0],
      data: body,
      params: query,
    })
  }

  private send(action: string, args: { params?: object; body?: unknown; query?: unknown }) {
    return this.request(`${this.resource}.${action}` as RouteName, args as never) as Promise<never>
  }

  baseDataTable(params: object = {}): Reply<`${this['resource']}.index`> {
    return this.send('index', { query: params })
  }

  baseOptions(params: object = {}): Reply<`${this['resource']}.options`> {
    return this.send('options', { query: params })
  }

  baseShow(id: number): Reply<`${this['resource']}.show`> {
    return this.send('show', { params: { id } })
  }

  baseStore(
    body: Endpoint<`${this['resource']}.store`>['body']
  ): Reply<`${this['resource']}.store`> {
    return this.send('store', { body })
  }

  baseStoreFile(
    body: Endpoint<`${this['resource']}.store`>['body']
  ): Reply<`${this['resource']}.store`> {
    const formData = this.baseFormData(body)

    return this.send('store', { body: formData })
  }

  baseUpdate(
    id: number,
    body: Endpoint<`${this['resource']}.update`>['body']
  ): Reply<`${this['resource']}.update`> {
    return this.send('update', { params: { id }, body })
  }

  baseUpdateFile(
    id: number,
    body: Endpoint<`${this['resource']}.update`>['body']
  ): Reply<`${this['resource']}.update`> {
    const formData = this.baseFormData(body)

    return this.send('update', { params: { id }, body: formData })
  }

  baseDelete(id: number): Reply<`${this['resource']}.delete`> {
    return this.send('delete', { params: { id } })
  }

  baseFormData(data: { [key: string]: any } = {}) {
    const formData = new FormData()
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined || value === null) continue
      if (Array.isArray(value)) value.forEach((item) => formData.append(`${key}[]`, toField(item)))
      else formData.append(key, toField(value))
    }
    return formData
  }

  async baseFileDownload(url: string, options = {}) {
    return this.connect()
      .get(url, {
        ...options,
        responseType: 'blob',
      })
      .then((response) => {
        const fileName = response.headers['content-disposition']
          .replaceAll('"', '')
          .replace('attachment; filename=', '')
        fileDownload(response.data, fileName)
        return response
      })
      .catch(async (error) => {
        const { status } = error.response

        if ([504].includes(status)) return Promise.reject(new Error(error))

        return this.connect()
          .get(url, options)
          .catch((retryError) => {
            const { data } = retryError.response
            message.error(data.message)
          })
      })
  }
}
