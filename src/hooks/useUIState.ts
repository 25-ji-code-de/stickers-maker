// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import { useState, useCallback } from 'react'
import { UIState } from '../types'

/**
 * Hook for managing UI state (modals and notifications)
 */
export function useUIState(): UIState {
  const [infoOpen, setInfoOpen] = useState<boolean>(false)
  const [uploadOpen, setUploadOpen] = useState<boolean>(false)
  const [copyPopupOpen, setCopyPopupOpen] = useState<boolean>(false)
  const [downloadPopupOpen, setDownloadPopupOpen] = useState<boolean>(false)

  const showCopySuccess = useCallback((): void => {
    setCopyPopupOpen(true)
  }, [])

  const showDownloadSuccess = useCallback((): void => {
    setDownloadPopupOpen(true)
  }, [])

  return {
    infoOpen,
    setInfoOpen,
    uploadOpen,
    setUploadOpen,
    copyPopupOpen,
    setCopyPopupOpen,
    showCopySuccess,
    downloadPopupOpen,
    setDownloadPopupOpen,
    showDownloadSuccess,
  }
}
