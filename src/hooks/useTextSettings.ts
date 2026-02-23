// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import { useState, useCallback } from 'react'
import characters from '../characters.json'
import { Character, TextSettings, FontKey } from '../types'

const DEFAULT_FONT_KEY: FontKey = 'yuruka'

// Type assertion for characters.json
const typedCharacters = characters as Character[]

/**
 * Hook for managing all text styling properties
 */
export function useTextSettings(character: number): TextSettings {
  const [text, setText] = useState<string>(typedCharacters[character].defaultText.text || '请输入文本')
  const [fontSize, setFontSize] = useState<number>(typedCharacters[character].defaultText.s)
  const [fontKey, setFontKey] = useState<FontKey>(DEFAULT_FONT_KEY)
  const [rotate, setRotate] = useState<number>(typedCharacters[character].defaultText.r)
  const [spaceSize, setSpaceSize] = useState<number>(25)
  const [letterSpacing, setLetterSpacing] = useState<number>(0)
  const [curve, setCurve] = useState<boolean>(false)
  const [vertical, setVertical] = useState<boolean>(false)
  const [textBehind, setTextBehind] = useState<boolean>(false)

  const resetTextSettings = useCallback(
    (currentCharacter: number): void => {
      const char = typedCharacters[currentCharacter]
      setText(char.defaultText.text || '请输入文本')
      setFontSize(char.defaultText.s)
      setRotate(char.defaultText.r)
      setSpaceSize(25)
      setLetterSpacing(0)
      setCurve(false)
      setVertical(false)
      setFontKey(DEFAULT_FONT_KEY)
      setTextBehind(false)
    },
    []
  )

  return {
    text,
    setText,
    fontSize,
    setFontSize,
    fontKey,
    setFontKey,
    rotate,
    setRotate,
    spaceSize,
    setSpaceSize,
    letterSpacing,
    setLetterSpacing,
    curve,
    setCurve,
    vertical,
    setVertical,
    textBehind,
    setTextBehind,
    resetTextSettings,
  }
}
