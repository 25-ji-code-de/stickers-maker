// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import { useState, useEffect, useCallback, RefObject } from 'react'
import characters from '../characters.json'
import { Character, CharacterHook } from '../types'

const typedCharacters = characters as Character[]

/**
 * Hook for managing character selection and image loading
 */
export function useCharacter(
  fileInputRef: RefObject<HTMLInputElement>,
  onImageLoad?: (img: HTMLImageElement) => void
): CharacterHook {
  const [character, setCharacter] = useState<number>(49)
  const [customImage, setCustomImage] = useState<string | null>(null)
  const [imgObj, setImgObj] = useState<HTMLImageElement | null>(null)
  const [loaded, setLoaded] = useState<boolean>(false)

  useEffect(() => {
    setLoaded(false)
    setImgObj(null)

    const img = new Image()
    img.src = customImage ?? '/img/' + typedCharacters[character].img
    img.onload = () => {
      setImgObj(img)
      setLoaded(true)
      if (onImageLoad) {
        onImageLoad(img)
      }
    }
  }, [character, customImage, onImageLoad])

  const handleUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const file = e.target.files && e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev: ProgressEvent<FileReader>) => {
        const result = ev.target && ev.target.result
        if (typeof result === 'string') {
          setLoaded(false)
          setCustomImage(result)
          if (fileInputRef.current) fileInputRef.current.value = ''
        }
      }
      reader.readAsDataURL(file)
    },
    [fileInputRef]
  )

  const clearUpload = useCallback((): void => {
    setLoaded(false)
    setCustomImage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [fileInputRef])

  return {
    character,
    setCharacter,
    customImage,
    imgObj,
    loaded,
    handleUpload,
    clearUpload,
  }
}
