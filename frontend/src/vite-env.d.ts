/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly [key: string]: string | boolean | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.css' {
  const content: Record<string, string>
  export default content
}
