import FlashToaster from '#inertia/components/flash_toaster'
import { type Data } from '@generated/data'
import { Head } from '@inertiajs/react'
import { Card, Typography } from 'antd'
import { type ReactNode, type ReactElement } from 'react'

interface Props {
  title: string
  description?: ReactNode
  children: ReactElement<Data.SharedProps>
}

export default function AuthLayout({ title, description, children }: Props) {
  return (
    <>
      <Head title={title} />

      <div className="flex min-h-dvh items-center justify-center p-4">
        <Card className="w-full max-w-sm shadow-sm">
          <div className="mb-6 text-center">
            <Typography.Title level={3} className="mb-1!">
              {title}
            </Typography.Title>
            {description && <Typography.Text type="secondary">{description}</Typography.Text>}
          </div>

          {children}
        </Card>
      </div>

      <FlashToaster />
    </>
  )
}
