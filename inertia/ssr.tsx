import Application from '#inertia/application'
import { client } from '#inertia/client'
import MainLayout from '#inertia/layouts/main_layout'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { TuyauProvider } from '@adonisjs/inertia/react'
import { type Data } from '@generated/data'
import { createInertiaApp, type ResolvedComponent } from '@inertiajs/react'
import { type ReactElement } from 'react'
import ReactDOMServer from 'react-dom/server'

export default function render(page: any) {
  return createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    resolve: (name) => {
      return resolvePageComponent<ResolvedComponent>(
        `./pages/${name}.tsx`,
        import.meta.glob<ResolvedComponent>('./pages/**/*.tsx', { eager: true }),
        (resolvedPage: ReactElement<Data.SharedProps>) => <MainLayout children={resolvedPage} />
      )
    },
    setup: ({ App, props }) => {
      return (
        <TuyauProvider client={client}>
          <Application {...{ App, ...props }} />
        </TuyauProvider>
      )
    },
  })
}
