import app from '@adonisjs/core/services/app'
import { type HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import type { HttpError, StatusPageRange, StatusPageRenderer } from '@adonisjs/core/types/http'
import { errors as vineErrors } from '@vinejs/vine'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * Status pages are used to display a custom HTML pages for certain error
   * codes. You might want to enable them in production only, but feel
   * free to enable them in development as well.
   */
  protected renderStatusPages = app.inProduction

  /**
   * Status pages is a collection of error code range and a callback
   * to return the HTML contents to send as a response.
   */
  protected statusPages: Record<StatusPageRange, StatusPageRenderer> = {
    '404': (_, { inertia }) => inertia.render('errors/not_found', {}),
    '500..599': (_, { inertia }) => inertia.render('errors/server_error', {}),
  }

  /**
   * `/api` routes always answer JSON, whatever the `Accept` header says.
   */
  #wantsJson(ctx: HttpContext) {
    return ctx.request.url().startsWith('/api/') || ctx.request.accepts(['html', 'json']) === 'json'
  }

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    if (!this.#wantsJson(ctx)) return super.handle(error, ctx)

    if (error instanceof vineErrors.E_VALIDATION_ERROR) {
      return this.renderValidationErrorAsJSON(this.toHttpError(error), ctx)
    }

    /**
     * Every other error is `{ message }` with its status, in development too.
     * The stack goes to the log through `report()`. A 5xx message can carry
     * internals such as SQL, so production replaces it.
     */
    const httpError = this.toHttpError(error)
    const message =
      httpError.status >= 500 && app.inProduction ? 'Internal server error' : httpError.message

    return ctx.response.status(httpError.status).send({ message })
  }

  /**
   * Laravel's shape, `{ message, errors: { field: [message, …] } }`. Overridden
   * here rather than through a VineJS error reporter, because the Inertia path
   * (`flashValidationErrors`) needs VineJS's default messages array.
   */
  async renderValidationErrorAsJSON(error: HttpError, ctx: HttpContext) {
    const messages: { field: string; message: string }[] = error.messages
    const errors: Record<string, string[]> = {}
    for (const { field, message } of messages) (errors[field] ??= []).push(message)

    ctx.response.status(error.status).send({ message: messages[0]?.message, errors })
  }

  /**
   * The method is used to report error to the logging service or
   * the a third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
