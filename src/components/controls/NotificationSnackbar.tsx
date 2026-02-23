// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import { Snackbar } from '@mui/material'

interface NotificationSnackbarProps {
  open: boolean
  message: string
  onClose: () => void
  duration?: number
}

/**
 * Reusable notification snackbar component
 */
export default function NotificationSnackbar({
  open,
  message,
  onClose,
  duration = 3000
}: NotificationSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      message={message}
    />
  )
}
