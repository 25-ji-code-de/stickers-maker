// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import { useState, useEffect } from 'react'
import { Snackbar, Button, Box } from '@mui/material'
import { useRegisterSW } from 'virtual:pwa-register/react'

export default function PWAUpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false)

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      console.log('Service Worker 已注册')
      // 每小时检查一次更新
      if (registration) {
        setInterval(() => {
          registration.update()
        }, 60 * 60 * 1000)
      }
    },
    onRegisterError(error) {
      console.error('Service Worker 注册失败:', error)
    },
  })

  useEffect(() => {
    if (needRefresh) {
      setShowPrompt(true)
    }
  }, [needRefresh])

  const handleUpdate = () => {
    updateServiceWorker(true)
    setShowPrompt(false)
  }

  const handleClose = () => {
    setShowPrompt(false)
    setNeedRefresh(false)
  }

  return (
    <Snackbar
      open={showPrompt}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      onClose={handleClose}
    >
      <Box
        sx={{
          bgcolor: 'rgb(67, 60, 61)',
          color: 'rgb(228, 194, 200)',
          px: 2,
          py: 1.5,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          boxShadow: '0 4px 12px rgba(67, 60, 61, 0.6)',
        }}
      >
        <span style={{ fontWeight: 500 }}>有新版本可用！</span>
        <Button
          size="small"
          onClick={handleUpdate}
          sx={{
            bgcolor: 'rgb(228, 194, 200)',
            color: 'rgb(67, 60, 61)',
            fontWeight: 600,
            '&:hover': {
              bgcolor: 'rgba(228, 194, 200, 0.85)',
            },
          }}
        >
          更新
        </Button>
        <Button
          size="small"
          onClick={handleClose}
          sx={{
            color: 'rgb(228, 194, 200)',
            fontWeight: 500,
          }}
        >
          稍后
        </Button>
      </Box>
    </Snackbar>
  )
}
