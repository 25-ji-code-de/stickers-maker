// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

/**
 * OIDC Discovery service
 */

import { OIDCConfig } from '../types'

const ISSUER = import.meta.env.VITE_OAUTH_ISSUER || 'https://id.nightcord.de5.net'
const WELL_KNOWN_PATH = '/.well-known/openid-configuration'

let cachedConfig: OIDCConfig | null = null
/** Single-flight in-flight discovery (aligns with ecosystem refresh pattern) */
let inflight: Promise<OIDCConfig> | null = null

/**
 * Fetch OIDC configuration from .well-known endpoint
 * @returns OIDC configuration
 * @throws Error if fetch fails
 */
export async function fetchOIDCConfig(): Promise<OIDCConfig> {
  if (cachedConfig) {
    return cachedConfig
  }
  if (inflight) {
    return inflight
  }

  inflight = (async () => {
    try {
      const url = `${ISSUER}${WELL_KNOWN_PATH}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to fetch OIDC config: ${response.statusText}`)
      }

      const config: OIDCConfig = await response.json()

      if (!config.authorization_endpoint || !config.token_endpoint || !config.userinfo_endpoint) {
        throw new Error('Invalid OIDC configuration: missing required endpoints')
      }

      cachedConfig = config
      return config
    } catch (err) {
      throw new Error(
        `OIDC discovery failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      )
    } finally {
      inflight = null
    }
  })()

  return inflight
}

/**
 * Get authorization endpoint URL
 */
export async function getAuthorizationEndpoint(): Promise<string> {
  const config = await fetchOIDCConfig()
  return config.authorization_endpoint
}

/**
 * Get token endpoint URL
 */
export async function getTokenEndpoint(): Promise<string> {
  const config = await fetchOIDCConfig()
  return config.token_endpoint
}

/**
 * Get userinfo endpoint URL
 */
export async function getUserInfoEndpoint(): Promise<string> {
  const config = await fetchOIDCConfig()
  return config.userinfo_endpoint
}

/**
 * Clear discovery cache (tests / issuer rotation).
 */
export function clearOIDCCache(): void {
  cachedConfig = null
  inflight = null
}
