// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import { useState, useCallback } from 'react'
import { FastAverageColor } from 'fast-average-color'
import { desaturateColor } from '../utils/colorUtils'
import characters from '../characters.json'
import { Character, ColorScheme } from '../types'

const fac = new FastAverageColor()
const typedCharacters = characters as Character[]

/**
 * Hook for managing theme and text colors with automatic extraction from images
 */
export function useColorScheme(character: number): ColorScheme {
  const [dominantColor, setDominantColor] = useState<string>('#cf93d9')
  const [backgroundColor, setBackgroundColor] = useState<string>('#212121')
  const [textColor, setTextColor] = useState<string>(typedCharacters[character].color)

  const updateColorsFromImage = useCallback((imgObj: HTMLImageElement): void => {
    const color = fac.getColor(imgObj, { algorithm: 'sqrt' })
    setDominantColor(color.hex)
    setBackgroundColor(desaturateColor(color.hex))
  }, [])

  return {
    dominantColor,
    backgroundColor,
    textColor,
    setTextColor,
    updateColorsFromImage,
  }
}
