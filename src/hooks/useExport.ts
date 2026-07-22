// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import { useCallback, RefObject } from 'react'
import { b64toBlob } from '../utils/imageConversion'
import {
  canvasWithWhiteBackground,
  prepareExportCanvas,
} from '../utils/cropCanvas'
import characters from '../characters.json'
import { Character, ExportHooks } from '../types'

const { ClipboardItem } = window
const typedCharacters = characters as Character[]

export interface ExportSettings {
  /** Export pixel scale relative to the cropped preview canvas (1 / 2 / 3). */
  scale: number
  /**
   * Lossy quality 0–1 for JPG / WEBP.
   * PNG exports ignore this (always lossless).
   */
  quality: number
  /** When false, lossy formats use quality 1 (maximum). */
  compress: boolean
}

/**
 * Hook that handles all export/download/copy operations.
 * Exports are auto-cropped to non-transparent content, then optionally scaled.
 */
export function useExport(
  canvasRef: RefObject<HTMLCanvasElement>,
  character: number,
  customImage: string | null,
  text: string,
  setCopyPopupOpen: (open: boolean) => void,
  setDownloadPopupOpen: (open: boolean) => void,
  exportSettings: ExportSettings
): ExportHooks {
  const { scale, quality, compress } = exportSettings

  const generateFileName = useCallback(
    (ext: string): string => {
      // Remove spaces and illegal characters
      const sanitize = (str: string): string => str.replace(/[\s\/\\:*?"<>|]/g, '')

      const characterName = customImage ? '自定义角色' : sanitize(typedCharacters[character].name)

      // If text is not default, add it to filename (max 10 characters)
      if (text && text !== '请输入文本') {
        const sanitizedText = sanitize(text).slice(0, 10)
        return `${characterName}_${sanitizedText}.${ext}`
      }
      return `${characterName}.${ext}`
    },
    [character, text, customImage]
  )

  /** Preview canvas stays 296×256; export uses content bounds + scale. */
  const getExportCanvas = useCallback((): HTMLCanvasElement | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    return prepareExportCanvas(canvas, scale)
  }, [canvasRef, scale])

  const lossyQuality = compress ? Math.min(1, Math.max(0.1, quality)) : 1

  const download = useCallback(async (): Promise<void> => {
    const exportCanvas = getExportCanvas()
    if (!exportCanvas) return
    const link = document.createElement('a')
    link.download = generateFileName('png')
    link.href = exportCanvas.toDataURL('image/png')
    link.click()
    setDownloadPopupOpen(true)
  }, [getExportCanvas, generateFileName, setDownloadPopupOpen])

  const downloadWebp = useCallback(async (): Promise<void> => {
    const exportCanvas = getExportCanvas()
    if (!exportCanvas) return
    const link = document.createElement('a')
    link.download = generateFileName('webp')
    link.href = exportCanvas.toDataURL('image/webp', lossyQuality)
    link.click()
    setDownloadPopupOpen(true)
  }, [getExportCanvas, generateFileName, setDownloadPopupOpen, lossyQuality])

  const downloadJpg = useCallback(async (): Promise<void> => {
    const exportCanvas = getExportCanvas()
    if (!exportCanvas) return
    const withBg = canvasWithWhiteBackground(exportCanvas)
    const link = document.createElement('a')
    link.download = generateFileName('jpg')
    link.href = withBg.toDataURL('image/jpeg', lossyQuality)
    link.click()
    setDownloadPopupOpen(true)
  }, [getExportCanvas, generateFileName, setDownloadPopupOpen, lossyQuality])

  const copy = useCallback(async (): Promise<void> => {
    const exportCanvas = getExportCanvas()
    if (!exportCanvas) return
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': b64toBlob(exportCanvas.toDataURL().split(',')[1]),
      }),
    ])
    setCopyPopupOpen(true)
  }, [getExportCanvas, setCopyPopupOpen])

  const copyWithBg = useCallback(async (): Promise<void> => {
    const exportCanvas = getExportCanvas()
    if (!exportCanvas) return
    const withBg = canvasWithWhiteBackground(exportCanvas)
    // Clipboard paste still uses PNG container for broader support,
    // with opaque white background baked in.
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': b64toBlob(withBg.toDataURL('image/png').split(',')[1]),
      }),
    ])
    setCopyPopupOpen(true)
  }, [getExportCanvas, setCopyPopupOpen])

  return {
    download,
    downloadWebp,
    downloadJpg,
    copy,
    copyWithBg,
  }
}
