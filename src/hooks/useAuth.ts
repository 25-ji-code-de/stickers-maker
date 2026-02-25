// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

/**
 * Authentication hook for React components
 */

import { useState, useEffect } from 'react'
import { AuthUser, AuthHook } from '../types'
import { initiateLogin, logout as authLogout, getCurrentAuth } from '../services/auth.service'

export function useAuth(): AuthHook {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Check auth state on mount
  useEffect(() => {
    checkAuth()
  }, [])

  /**
   * Check current authentication status
   */
  const checkAuth = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const authState = await getCurrentAuth()
      if (authState) {
        setUser(authState.user)
      } else {
        setUser(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Initiate login flow
   */
  const login = async () => {
    setError(null)
    try {
      await initiateLogin()
      // Will redirect to SEKAI Pass
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      throw err
    }
  }

  /**
   * Logout user
   */
  const logout = async () => {
    setError(null)
    try {
      authLogout()
      setUser(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed')
      throw err
    }
  }

  /**
   * Refresh authentication (check if still valid)
   */
  const refreshAuth = async () => {
    await checkAuth()
  }

  return {
    user,
    isAuthenticated: user !== null,
    isLoading,
    error,
    login,
    logout,
    refreshAuth,
  }
}
