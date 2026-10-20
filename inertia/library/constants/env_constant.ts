type NodeEnv = 'production' | 'development' | 'test'

const nodeEnv = import.meta.env.VITE_NODE_ENV as NodeEnv

export const env = {
  appName: import.meta.env.VITE_APP_NAME ?? 'AdonisJS',
  nodeEnv,
  debug: nodeEnv !== 'production',

  adminEmail: import.meta.env.VITE_ADMIN_EMAIL,
  adminPass: import.meta.env.VITE_ADMIN_PASS,
}
