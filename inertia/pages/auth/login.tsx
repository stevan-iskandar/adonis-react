import AuthLayout from '#inertia/layouts/auth_layout'
import { env } from '#inertia/library/constants/env_constant'
import { Form } from '@adonisjs/inertia/react'
import { type Data } from '@generated/data'
import { type ReactElement } from 'react'

export default function Login() {
  return (
    <div className="form-container">
      <div>
        <h1> Login </h1>
        <p>Enter your details below to login to your account</p>
      </div>

      <div>
        <Form route="web.auth.login.submit">
          {({ errors }) => (
            <>
              <div>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="username"
                  data-invalid={errors.email ? 'true' : undefined}
                  defaultValue={env.debug ? env.adminEmail : undefined}
                />
                {errors.email && <div>{errors.email}</div>}
              </div>

              <div>
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  autoComplete="current-password"
                  defaultValue={env.debug ? env.adminPass : undefined}
                />
                {errors.password ? <span>{errors.password}</span> : ''}
              </div>

              <div>
                <button type="submit" className="button">
                  Login
                </button>
              </div>
            </>
          )}
        </Form>
      </div>
    </div>
  )
}

Login.layout = (page: ReactElement<Data.SharedProps>) => <AuthLayout>{page}</AuthLayout>
