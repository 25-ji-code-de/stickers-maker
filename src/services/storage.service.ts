// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

/**
 * Storage service for OAuth tokens and state
 */

import { AuthState } from '../types'

const AUTH_STATE_KEY = 'ayaka_auth_state'
const PKCE_VERIFIER_KEY = 'ayaka_pkce_verifier'
const OAUTH_STATE_KEY = 'ayaka_oauth_state'

/**
 * Save auth state to localStorage
 */
export function saveAuthState(state: AuthState): void {
  try {
    localStorage.setItem(AUTH_STATE_KEY, JSON.stringify(state))
  } catch (err) {
    console.error('Failed to save auth state:', err)
  }
}

/**
 * Load auth state from localStorage
 */
export function loadAuthState(): AuthState | null {
  try {
    const stored = localStorage.getItem(AUTH_STATE_KEY)
    if (!stored) {
      return null
    }
    return JSON.parse(stored) as AuthState
  } catch (err) {
    console.error('Failed to load auth state:', err)
    return null
  }
}

/**
 * Clear auth state from localStorage
 */
export function clearAuthState(): void {
  try {
    localStorage.removeItem(AUTH_STATE_KEY)
  } catch (err) {
    console.error('Failed to clear auth state:', err)
  }
}

/**
 * Save PKCE code verifier (temporary, for OAuth flow)
 */
export function savePKCEVerifier(verifier: string): void {
  try {
    sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier)
  } catch (err) {
    console.error('Failed to save PKCE verifier:', err)
  }
}

/**
 * Load and remove PKCE code verifier
 */
export function consumePKCEVerifier(): string | null {
  try {
    const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY)
    if (verifier) {
      sessionStorage.removeItem(PKCE_VERIFIER_KEY)
    }
    return verifier
  } catch (err) {
    console.error('Failed to consume PKCE verifier:', err)
    return null
  }
}

/**
 * Save OAuth state parameter (temporary, for CSRF protection)
 */
export function saveOAuthState(state: string): void {
  try {
    sessionStorage.setItem(OAUTH_STATE_KEY, state)
  } catch (err) {
    console.error('Failed to save OAuth state:', err)
  }
}

/**
 * Load and remove OAuth state parameter
 */
export function consumeOAuthState(): string | null {
  try {
    const state = sessionStorage.getItem(OAUTH_STATE_KEY)
    if (state) {
      sessionStorage.removeItem(OAUTH_STATE_KEY)
    }
    return state
  } catch (err) {
    console.error('Failed to consume OAuth state:', err)
    return null
  }
}
