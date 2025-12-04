/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HOLIDAY_API_URL?: string
  readonly VITE_HOLIDAY_COUNTRY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
