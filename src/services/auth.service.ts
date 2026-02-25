// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

/**
 * OAuth 2.1 + OIDC Authentication Service
 */

import { AuthUser, AuthState, TokenResponse, OIDCUserInfo } from '../types'
import { generateCodeVerifier, generateCodeChallenge, generateState } from '../utils/crypto.utils'
import { parseJWT, isTokenExpired } from '../utils/jwt.utils'
import {
  saveAuthState,
  loadAuthState,
  clearAuthState,
  savePKCEVerifier,
  consumePKCEVerifier,
  saveOAuthState,
  consumeOAuthState,
} from './storage.service'
import {
  getAuthorizationEndpoint,
  getTokenEndpoint,
  getUserInfoEndpoint,
} from './oidc.service'

const CLIENT_ID = import.meta.env.VITE_OAUTH_CLIENT_ID || ''
const REDIRECT_URI = import.meta.env.VITE_OAUTH_REDIRECT_URI || `${window.location.origin}/callback`
const SCOPE = import.meta.env.VITE_OAUTH_SCOPE || 'openid profile email'

/**
 * Start OAuth login flow
 * Redirects to authorization endpoint with PKCE parameters
 */
export async function initiateLogin(): Promise<void> {
  try {
    // Generate PKCE parameters
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = await generateCodeChallenge(codeVerifier)
    const state = generateState()

    // Store for later verification
    savePKCEVerifier(codeVerifier)
    saveOAuthState(state)

    // Build authorization URL
    const authEndpoint = await getAuthorizationEndpoint()
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: SCOPE,
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    })

    // Redirect to authorization endpoint
    window.location.href = `${authEndpoint}?${params.toString()}`
  } catch (err) {
    throw new Error(`Failed to initiate login: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }
}

/**
 * Handle OAuth callback
 * Exchanges authorization code for tokens
 * @param code - Authorization code from callback URL
 * @param state - State parameter from callback URL
 * @returns Auth state with user info
 * @throws Error if exchange fails or state mismatch
 */
export async function handleCallback(code: string, state: string): Promise<AuthState> {
  try {
    // Verify state parameter (CSRF protection)
    const expectedState = consumeOAuthState()
    if (!expectedState || expectedState !== state) {
      throw new Error('Invalid state parameter - possible CSRF attack')
    }

    // Get code verifier
    const codeVerifier = consumePKCEVerifier()
    if (!codeVerifier) {
      throw new Error('Missing PKCE code verifier')
    }

    // Exchange code for tokens
    const tokenEndpoint = await getTokenEndpoint()
    const tokenResponse = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        code_verifier: codeVerifier,
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      throw new Error(`Token exchange failed: ${error}`)
    }

    const tokens: TokenResponse = await tokenResponse.json()

    // Get user info
    const user = await fetchUserInfo(tokens.access_token)

    // Calculate expiration time
    const expiresAt = Date.now() + tokens.expires_in * 1000

    // Create and save auth state
    const authState: AuthState = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      idToken: tokens.id_token,
      expiresAt: expiresAt,
      user: user,
    }

    saveAuthState(authState)

    return authState
  } catch (err) {
    throw new Error(`Callback handling failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }
}

/**
 * Fetch user info from userinfo endpoint
 * @param accessToken - Access token
 * @returns User information
 */
async function fetchUserInfo(accessToken: string): Promise<AuthUser> {
  try {
    const userinfoEndpoint = await getUserInfoEndpoint()
    const response = await fetch(userinfoEndpoint, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.statusText}`)
    }

    const userInfo: OIDCUserInfo = await response.json()

    // Map OIDC user info to AuthUser
    return {
      id: userInfo.sub,
      username: userInfo.preferred_username || userInfo.name || userInfo.sub,
      email: userInfo.email || null,
      avatar: userInfo.picture || null,
    }
  } catch (err) {
    throw new Error(`User info fetch failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }
}

/**
 * Refresh access token using refresh token
 * @param refreshToken - Refresh token
 * @returns New auth state
 * @throws Error if refresh fails
 */
export async function refreshAccessToken(refreshToken: string): Promise<AuthState> {
  try {
    const tokenEndpoint = await getTokenEndpoint()
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
      }),
    })

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`)
    }

    const tokens: TokenResponse = await response.json()

    // Get updated user info
    const user = await fetchUserInfo(tokens.access_token)

    // Calculate new expiration time
    const expiresAt = Date.now() + tokens.expires_in * 1000

    // Create and save new auth state
    const authState: AuthState = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || refreshToken, // Keep old refresh token if not provided
      idToken: tokens.id_token,
      expiresAt: expiresAt,
      user: user,
    }

    saveAuthState(authState)

    return authState
  } catch (err) {
    // Clear auth state on refresh failure
    clearAuthState()
    throw new Error(`Token refresh failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }
}

/**
 * Logout and clear auth state
 */
export function logout(): void {
  clearAuthState()
}

/**
 * Get current auth state
 * Automatically refreshes if expired and refresh token is available
 * @returns Current auth state or null if not authenticated
 */
export async function getCurrentAuth(): Promise<AuthState | null> {
  const authState = loadAuthState()

  if (!authState) {
    return null
  }

  // Check if token is expired
  const isExpired = Date.now() >= authState.expiresAt

  if (isExpired && authState.refreshToken) {
    try {
      // Try to refresh
      return await refreshAccessToken(authState.refreshToken)
    } catch {
      // Refresh failed, clear state
      clearAuthState()
      return null
    }
  }

  if (isExpired) {
    // No refresh token, clear state
    clearAuthState()
    return null
  }

  return authState
}
