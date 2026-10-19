import FlashToaster from '#inertia/components/flash_toaster'
import { type Data } from '@generated/data'
import { Layout, Typography } from 'antd'
import { type ReactElement } from 'react'

export default function AuthLayout({ children }: { children: ReactElement<Data.SharedProps> }) {
  return (
    <Layout>
      <Typography.Title>Adonis</Typography.Title>
      <Layout.Content>{children}</Layout.Content>
      <FlashToaster />
    </Layout>
  )
}
