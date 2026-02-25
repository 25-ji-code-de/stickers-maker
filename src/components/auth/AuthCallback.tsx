// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

/**
 * OAuth callback handler component
 */

import { useEffect, useState } from 'react'
import { Box, CircularProgress, Alert, Typography } from '@mui/material'
import { handleCallback } from '../services/auth.service'

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    handleOAuthCallback()
  }, [])

  const handleOAuthCallback = async () => {
    try {
      // Parse URL parameters
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const state = params.get('state')
      const errorParam = params.get('error')
      const errorDescription = params.get('error_description')

      // Check for OAuth error
      if (errorParam) {
        throw new Error(errorDescription || errorParam)
      }

      // Validate required parameters
      if (!code || !state) {
        throw new Error('Missing authorization code or state parameter')
      }

      // Handle the callback
      await handleCallback(code, state)

      // Redirect to home page
      window.location.href = '/'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    }
  }

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        p={3}
      >
        <Alert severity="error" sx={{ mb: 2, maxWidth: 500 }}>
          <Typography variant="body1" gutterBottom>
            认证失败
          </Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
        <Typography variant="body2" color="text.secondary">
          <a href="/" style={{ color: 'inherit' }}>
            返回首页
          </a>
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <CircularProgress size={60} />
      <Typography variant="body1" color="text.secondary" mt={3}>
        正在完成登录...
      </Typography>
    </Box>
  )
}
