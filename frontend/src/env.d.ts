/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_REVERB_APP_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
