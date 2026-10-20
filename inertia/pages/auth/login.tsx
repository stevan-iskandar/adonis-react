import AuthLayout from '#inertia/layouts/auth_layout'
import { env } from '#inertia/library/constants/env_constant'
import { Form } from '@adonisjs/inertia/react'
import { type Data } from '@generated/data'
import { Form as AntdForm, Button, Checkbox, Input } from 'antd'
import { Lock, Mail } from 'lucide-react'
import { type ReactElement } from 'react'

export default function Login() {
  return (
    <>
      <Form route="web.auth.login.submit" disableWhileProcessing>
        {({ errors, processing }) => (
          <>
            <AntdForm.Item
              className="mb-4!"
              validateStatus={errors.email ? 'error' : undefined}
              help={errors.email}
            >
              <Input
                name="email"
                size="large"
                type="email"
                autoFocus
                autoComplete="username"
                placeholder="Email"
                prefix={<Mail size="1em" />}
                defaultValue={env.debug ? env.adminEmail : undefined}
              />
            </AntdForm.Item>

            <AntdForm.Item
              className="mb-4!"
              validateStatus={errors.password ? 'error' : undefined}
              help={errors.password}
            >
              <Input.Password
                name="password"
                size="large"
                autoComplete="current-password"
                placeholder="Password"
                prefix={<Lock size="1em" />}
                defaultValue={env.debug ? env.adminPass : undefined}
              />
            </AntdForm.Item>

            <AntdForm.Item className="mb-4!">
              <Checkbox name="remember">Remember me</Checkbox>
            </AntdForm.Item>

            <Button block htmlType="submit" type="primary" size="large" loading={processing}>
              Sign in
            </Button>
          </>
        )}
      </Form>
    </>
  )
}

Login.layout = (page: ReactElement<Data.SharedProps>) => (
  <AuthLayout title="Login" description="Enter your details below to login to your account">
    {page}
  </AuthLayout>
)
