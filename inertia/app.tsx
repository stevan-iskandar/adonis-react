import Application from '#inertia/application'
import '#inertia/assets/css/app.css'
import { client } from '#inertia/client'
import MainLayout from '#inertia/layouts/main_layout'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { TuyauProvider } from '@adonisjs/inertia/react'
import { type Data } from '@generated/data'
import { createInertiaApp, type ResolvedComponent } from '@inertiajs/react'
import { type ReactElement } from 'react'
import { createRoot } from 'react-dom/client'

const appName = import.meta.env.VITE_APP_NAME || 'AdonisJS'

createInertiaApp({
  title: (title) => (title ? `${title} - ${appName}` : appName),
  resolve: (name) => {
    return resolvePageComponent<ResolvedComponent>(
      `./pages/${name}.tsx`,
      import.meta.glob<ResolvedComponent>('./pages/**/*.tsx'),
      (page: ReactElement<Data.SharedProps>) => <MainLayout children={page} />
    )
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <TuyauProvider client={client}>
        <Application {...{ App, ...props }} />
      </TuyauProvider>
    )
  },
  progress: {
    color: '#4B5563',
  },
})
