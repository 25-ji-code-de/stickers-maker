// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import { useState, useCallback } from 'react'
import { StrokeSettings } from '../types'

const DEFAULT_STROKE_WIDTH = 9
const DEFAULT_STROKE_COLOR = '#ffffff'

/**
 * Hook for managing stroke/outline settings
 */
export function useStroke(): StrokeSettings {
  const [strokeWidth, setStrokeWidth] = useState<number>(DEFAULT_STROKE_WIDTH)
  const [strokeColor, setStrokeColor] = useState<string>(DEFAULT_STROKE_COLOR)

  const resetStroke = useCallback((): void => {
    setStrokeWidth(DEFAULT_STROKE_WIDTH)
    setStrokeColor(DEFAULT_STROKE_COLOR)
  }, [])

  return {
    strokeWidth,
    setStrokeWidth,
    strokeColor,
    setStrokeColor,
    resetStroke,
  }
}
