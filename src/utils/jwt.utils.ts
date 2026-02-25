// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

/**
 * JWT parsing utilities (no signature verification - trust the issuer)
 */

interface JWTPayload {
  sub: string
  iss?: string
  aud?: string
  exp?: number
  iat?: number
  [key: string]: unknown
}

/**
 * Parse JWT token and extract payload
 * @param token - The JWT token
 * @returns Decoded payload
 * @throws Error if token format is invalid
 */
export function parseJWT(token: string): JWTPayload {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format')
    }

    const payload = parts[1]
    const decoded = base64URLDecode(payload)
    return JSON.parse(decoded)
  } catch (err) {
    throw new Error(`Failed to parse JWT: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }
}

/**
 * Check if JWT token is expired
 * @param token - The JWT token
 * @returns True if expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = parseJWT(token)
    if (!payload.exp) {
      return false // No expiration claim
    }

    const now = Math.floor(Date.now() / 1000)
    return payload.exp < now
  } catch {
    return true // Treat parsing errors as expired
  }
}

/**
 * Decode Base64URL string
 * @param base64url - Base64URL-encoded string
 * @returns Decoded string
 */
function base64URLDecode(base64url: string): string {
  // Convert Base64URL to Base64
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')

  // Add padding
  const padding = base64.length % 4
  if (padding > 0) {
    base64 += '='.repeat(4 - padding)
  }

  // Decode
  return atob(base64)
}
