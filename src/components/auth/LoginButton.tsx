// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

/**
 * Login button component
 */

import { Button, CircularProgress } from '@mui/material'
import { Login as LoginIcon } from '@mui/icons-material'
import { useAuth } from '../../hooks/useAuth'

interface LoginButtonProps {
  variant?: 'text' | 'outlined' | 'contained'
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
}

export default function LoginButton({
  variant = 'outlined',
  size = 'medium',
  fullWidth = false,
}: LoginButtonProps) {
  const { login, isLoading } = useAuth()

  const handleLogin = async () => {
    try {
      await login()
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      color="secondary"
      startIcon={isLoading ? <CircularProgress size={16} /> : <LoginIcon />}
      onClick={handleLogin}
      disabled={isLoading}
    >
      {isLoading ? '登录中...' : '登录 SEKAI Pass'}
    </Button>
  )
}
