// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  /** SEKAI Pass issuer，用于 OIDC discovery（见 .env.example） */
  readonly VITE_OAUTH_ISSUER: string
  readonly VITE_OAUTH_CLIENT_ID: string
  readonly VITE_OAUTH_REDIRECT_URI: string
  readonly VITE_OAUTH_SCOPE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
