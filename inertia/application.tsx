import { StyleProvider } from '@ant-design/cssinjs'
import { type App as InertiaApp } from '@inertiajs/react'
import { App as AntApp, ConfigProvider } from 'antd'
import enUS from 'antd/locale/en_US'
import { type ComponentProps, type ComponentType } from 'react'

type InertiaAppProps = ComponentProps<typeof InertiaApp>

type Props = InertiaAppProps & {
  App: ComponentType<InertiaAppProps>
}

export default function Application({ App, ...props }: Props) {
  return (
    <StyleProvider layer>
      <ConfigProvider locale={enUS} theme={{ token: { colorPrimary: '#1677ff' } }}>
        <AntApp>
          <App {...props} />
        </AntApp>
      </ConfigProvider>
    </StyleProvider>
  )
}
