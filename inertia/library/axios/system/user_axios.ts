import BaseAxios from '#inertia/library/axios/base_axios'

export default class UserAxios extends BaseAxios {
  readonly resource = 'api.system.user'

  changePassword(id: number, password: string) {
    return this.request('api.system.user.changePassword', { params: { id }, body: { password } })
  }
}
