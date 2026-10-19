import UserService from '#domain/system/user/user_service'
import { responseMessage } from '#library/helpers/response_message'
import UserTransformer from '#transformers/system/user_transformer'
import {
  createUserValidator,
  updateUserPasswordValidator,
  updateUserValidator,
} from '#validators/system/user_validator'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class UserController {
  private module = 'User'

  constructor(private readonly userService: UserService) {}

  async index({ request, serialize }: HttpContext) {
    const users = await this.userService.options(request.input('search'))

    return {
      message: responseMessage(this.module).successFetch,
      ...(await serialize(UserTransformer.transform(users))),
    }
  }

  async options({ request, serialize }: HttpContext) {
    const users = await this.userService.options(request.input('search'))

    return {
      message: responseMessage(this.module).successFetch,
      ...(await serialize(UserTransformer.transform(users))),
    }
  }

  async show({ params, serialize }: HttpContext) {
    const user = await this.userService.findById(params.id)

    return {
      message: responseMessage(this.module).successFetch,
      ...(await serialize(UserTransformer.transform(user))),
    }
  }

  async store({ request, response, auth, serialize }: HttpContext) {
    const payload = await request.validateUsing(createUserValidator)
    const user = await this.userService.create({ ...payload, authId: auth.getUserOrFail().id })

    response.status(201)
    return {
      message: responseMessage(this.module).successInsert,
      ...(await serialize(UserTransformer.transform(user))),
    }
  }

  async update({ params, request, auth, serialize }: HttpContext) {
    const payload = await request.validateUsing(updateUserValidator, {
      meta: { userId: params.id },
    })
    const user = await this.userService.update(params.id, {
      ...payload,
      authId: auth.getUserOrFail().id,
    })

    return {
      message: responseMessage(this.module).successUpdate,
      ...(await serialize(UserTransformer.transform(user))),
    }
  }

  async delete({ params }: HttpContext) {
    await this.userService.delete(params.id)

    return { message: responseMessage(this.module).successDelete }
  }

  async changePassword({ params, request }: HttpContext) {
    const payload = await request.validateUsing(updateUserPasswordValidator)
    await this.userService.changePassword(params.id, payload.password)

    return { message: responseMessage(this.module).successUpdate }
  }

  // FE
  async edit({ params, inertia }: HttpContext) {
    const user = await this.userService.findById(params.id)

    return inertia.render('system/user/edit', { user: UserTransformer.transform(user) })
  }
}
