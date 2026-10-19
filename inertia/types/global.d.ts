interface ViteTypeOptions {
  strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  VITE_APP_NAME?: string
  VITE_NODE_ENV?: string

  VITE_ADMIN_EMAIL?: string
  VITE_ADMIN_PASS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
