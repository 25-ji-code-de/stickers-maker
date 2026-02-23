// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import { useState, useCallback, useRef } from 'react'
import { StickerConfig } from '../types'

const MAX_HISTORY_SIZE = 50 // 最多保存50步历史

export interface UndoRedoHook {
  canUndo: boolean
  canRedo: boolean
  undo: () => StickerConfig | null
  redo: () => StickerConfig | null
  pushState: (state: StickerConfig) => void
  clearHistory: () => void
}

/**
 * Hook for managing undo/redo functionality
 * Uses a history stack to track state changes
 */
export function useUndoRedo(): UndoRedoHook {
  const [history, setHistory] = useState<StickerConfig[]>([])
  const [currentIndex, setCurrentIndex] = useState<number>(-1)
  const isUndoRedoAction = useRef<boolean>(false)

  const canUndo = currentIndex > 0
  const canRedo = currentIndex < history.length - 1

  /**
   * Push a new state to history
   * Clears any redo history when a new action is performed
   */
  const pushState = useCallback((state: StickerConfig) => {
    // Don't record state during undo/redo operations
    if (isUndoRedoAction.current) {
      return
    }

    setHistory(prevHistory => {
      // Remove any redo history after current position
      const newHistory = prevHistory.slice(0, currentIndex + 1)

      // Don't add if state is identical to the last one
      if (newHistory.length > 0) {
        const lastState = newHistory[newHistory.length - 1]
        if (JSON.stringify(lastState) === JSON.stringify(state)) {
          return prevHistory
        }
      }

      // Add new state
      newHistory.push({ ...state })

      // Limit history size
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift()
        setCurrentIndex(prev => prev) // Keep index the same (shifted array)
        return newHistory
      }

      setCurrentIndex(newHistory.length - 1)
      return newHistory
    })
  }, [currentIndex])

  /**
   * Undo to previous state
   * Returns the previous state to apply
   */
  const undo = useCallback((): StickerConfig | null => {
    if (!canUndo) return null

    isUndoRedoAction.current = true
    const newIndex = currentIndex - 1
    setCurrentIndex(newIndex)

    // Reset flag after a short delay to allow state updates
    setTimeout(() => {
      isUndoRedoAction.current = false
    }, 100)

    return newIndex >= 0 ? history[newIndex] : null
  }, [canUndo, currentIndex, history])

  /**
   * Redo to next state
   * Returns the next state to apply
   */
  const redo = useCallback((): StickerConfig | null => {
    if (!canRedo) return null

    isUndoRedoAction.current = true
    const newIndex = currentIndex + 1
    setCurrentIndex(newIndex)

    // Reset flag after a short delay to allow state updates
    setTimeout(() => {
      isUndoRedoAction.current = false
    }, 100)

    return newIndex < history.length ? history[newIndex] : null
  }, [canRedo, currentIndex, history])

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    setHistory([])
    setCurrentIndex(-1)
  }, [])

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    pushState,
    clearHistory,
  }
}
