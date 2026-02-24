// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import { useState, useEffect, useCallback, useRef } from 'react'
import { KeyboardShortcutsConfig, UseKeyboardShortcutsReturn } from '../types'

/**
 * Hook for managing keyboard shortcuts with input focus detection
 */
export function useKeyboardShortcuts(config: KeyboardShortcutsConfig): UseKeyboardShortcutsReturn {
  const [isInputFocused, setIsInputFocused] = useState(false)

  // RAF-based throttle for smooth continuous updates
  const rafId = useRef<number | null>(null)
  const pendingUpdates = useRef<Record<string, () => void>>({})

  // Track input focus state globally
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      const isInput =
        ['INPUT', 'TEXTAREA'].includes(target.tagName) ||
        target.isContentEditable ||
        target.getAttribute('contenteditable') === 'true'
      setIsInputFocused(isInput)
    }

    const handleFocusOut = () => {
      setIsInputFocused(false)
    }

    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)

    return () => {
      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('focusout', handleFocusOut)
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current)
      }
    }
  }, [])

  // RAF-based throttle function for smooth animations
  const scheduleUpdate = useCallback((key: string, fn: () => void) => {
    // Store the pending update
    pendingUpdates.current[key] = fn

    // If no RAF is scheduled, schedule one
    if (rafId.current === null) {
      rafId.current = requestAnimationFrame(() => {
        // Execute all pending updates
        Object.values(pendingUpdates.current).forEach(update => update())
        pendingUpdates.current = {}
        rafId.current = null
      })
    }
  }, [])

  // Main keyboard event handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const hasModifier = e.ctrlKey || e.metaKey
      const hasShift = e.shiftKey
      const key = e.key.toLowerCase()

      // Esc: Close dialogs (highest priority, always active)
      if (key === 'escape') {
        if (config.uiState.shortcutsHelpOpen) {
          config.uiState.setShortcutsHelpOpen(false)
          e.preventDefault()
          return
        }
        if (config.uiState.galleryOpen) {
          config.uiState.setGalleryOpen(false)
          e.preventDefault()
          return
        }
        if (config.uiState.historyOpen) {
          config.uiState.setHistoryOpen(false)
          e.preventDefault()
          return
        }
        if (config.uiState.infoOpen) {
          config.uiState.setInfoOpen(false)
          e.preventDefault()
          return
        }
        if (config.uiState.resetConfirmOpen) {
          config.uiState.setResetConfirmOpen(false)
          e.preventDefault()
          return
        }
        return
      }

      // Help shortcuts (always active)
      if (key === '?' || key === 'f1') {
        config.uiState.setShortcutsHelpOpen(true)
        e.preventDefault()
        return
      }

      // Ctrl/Cmd combination shortcuts (always active, even in input fields)
      if (hasModifier) {
        // Check if text is selected (preserve browser default copy/cut/paste)
        const hasSelection = !!window.getSelection()?.toString()

        // Undo/Redo
        if (key === 'z' && !hasShift) {
          config.handleUndo()
          e.preventDefault()
          return
        }
        if (key === 'y' || (key === 'z' && hasShift)) {
          config.handleRedo()
          e.preventDefault()
          return
        }

        // Export operations with Ctrl+Shift
        if (hasShift) {
          if (key === 'c') {
            // Allow default copy if text is selected
            if (hasSelection) return
            e.preventDefault()
            config.handleCopyWithBg()
            return
          }
          if (key === 's') {
            e.preventDefault()
            config.handleDownloadJpg()
            return
          }
          if (key === 'e') {
            // Changed from W to E to avoid browser window close conflict
            e.preventDefault()
            config.handleDownloadWebp()
            return
          }
        }

        // Export operations with Ctrl only
        if (!hasShift) {
          if (key === 'c') {
            // Allow default copy if text is selected
            if (hasSelection) return
            e.preventDefault()
            config.handleCopy()
            return
          }
          if (key === 's') {
            e.preventDefault()
            config.handleDownload()
            return
          }
          if (key === 'h') {
            e.preventDefault()
            config.uiState.setHistoryOpen(true)
            return
          }
          if (key === 'g') {
            e.preventDefault()
            config.uiState.setGalleryOpen(true)
            return
          }
          if (key === 'r') {
            e.preventDefault()
            config.uiState.setResetConfirmOpen(true)
            return
          }
          if (key === 'i') {
            e.preventDefault()
            config.uiState.setInfoOpen(true)
            return
          }
        }

        return
      }

      // Single-key shortcuts (disabled when input is focused)
      if (isInputFocused) {
        return
      }

      // Arrow keys for position adjustment (with RAF)
      if (key === 'arrowleft') {
        e.preventDefault()
        const delta = hasShift ? -1 : -5
        scheduleUpdate('moveX', () => config.position.moveX(delta))
        return
      }
      if (key === 'arrowright') {
        e.preventDefault()
        const delta = hasShift ? 1 : 5
        scheduleUpdate('moveX', () => config.position.moveX(delta))
        return
      }
      if (key === 'arrowup') {
        e.preventDefault()
        const delta = hasShift ? -1 : -5
        scheduleUpdate('moveY', () => config.position.moveY(delta))
        return
      }
      if (key === 'arrowdown') {
        e.preventDefault()
        const delta = hasShift ? 1 : 5
        scheduleUpdate('moveY', () => config.position.moveY(delta))
        return
      }

      // Style adjustments with Shift (check before other single-key shortcuts)
      if (hasShift) {
        // Line spacing: Shift+[ or Shift+]
        if (key === '[' || e.code === 'BracketLeft') {
          e.preventDefault()
          // Decrease line spacing
          scheduleUpdate('spaceSize', () => {
            const newSize = Math.max(18, config.spaceSize - 2)
            config.setSpaceSize(newSize)
          })
          return
        }
        if (key === ']' || e.code === 'BracketRight') {
          e.preventDefault()
          // Increase line spacing
          scheduleUpdate('spaceSize', () => {
            const newSize = Math.min(100, config.spaceSize + 2)
            config.setSpaceSize(newSize)
          })
          return
        }
        // If it's shift with other keys, don't process further
        // (This allows Shift+Arrow to work without falling through)
      }

      // Font size adjustments (with RAF)
      if (key === '+' || key === '=') {
        e.preventDefault()
        scheduleUpdate('fontSize', () => {
          const newSize = Math.min(100, config.fontSize + 2)
          config.setFontSize(newSize)
        })
        return
      }
      if (key === '-') {
        e.preventDefault()
        scheduleUpdate('fontSize', () => {
          const newSize = Math.max(10, config.fontSize - 2)
          config.setFontSize(newSize)
        })
        return
      }

      // Letter spacing adjustments (without Shift, with RAF)
      if (!hasShift) {
        if (key === '[' || e.code === 'BracketLeft') {
          e.preventDefault()
          scheduleUpdate('letterSpacing', () => {
            const newSpacing = Math.max(-10, config.letterSpacing - 1)
            config.setLetterSpacing(newSpacing)
          })
          return
        }
        if (key === ']' || e.code === 'BracketRight') {
          e.preventDefault()
          scheduleUpdate('letterSpacing', () => {
            const newSpacing = Math.min(30, config.letterSpacing + 1)
            config.setLetterSpacing(newSpacing)
          })
          return
        }
      }

      // Rotation adjustments (with RAF)
      if (key === ',') {
        e.preventDefault()
        scheduleUpdate('rotate', () => {
          const newRotate = Math.max(-10, config.rotate - 0.5)
          config.setRotate(newRotate)
        })
        return
      }
      if (key === '.') {
        e.preventDefault()
        scheduleUpdate('rotate', () => {
          const newRotate = Math.min(10, config.rotate + 0.5)
          config.setRotate(newRotate)
        })
        return
      }

      // Toggle switches (check if Shift is NOT pressed to avoid conflicts)
      if (!hasShift) {
        if (key === 'c') {
          config.setCurve(!config.curve)
          e.preventDefault()
          return
        }
        if (key === 'v') {
          config.setVertical(!config.vertical)
          e.preventDefault()
          return
        }
        if (key === 'b') {
          config.setTextBehind(!config.textBehind)
          e.preventDefault()
          return
        }
      }
    },
    [isInputFocused, config, scheduleUpdate]
  )

  // Register global keydown listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return {
    isInputFocused,
    shortcutsEnabled: !isInputFocused,
  }
}
