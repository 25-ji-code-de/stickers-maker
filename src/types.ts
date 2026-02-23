// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

/**
 * Common type definitions for the application
 */

export interface Position {
  x: number
  y: number
}

export interface Character {
  img: string
  name: string
  color: string
  defaultText: {
    x: number
    y: number
    r: number
    s: number
    text?: string
  }
}

export type FontKey = 'yuruka' | 'fangtang' | 'system'

export interface TextSettings {
  text: string
  setText: (text: string) => void
  fontSize: number
  setFontSize: (size: number) => void
  fontKey: FontKey
  setFontKey: (key: FontKey) => void
  rotate: number
  setRotate: (rotate: number) => void
  spaceSize: number
  setSpaceSize: (size: number) => void
  letterSpacing: number
  setLetterSpacing: (spacing: number) => void
  curve: boolean
  setCurve: (curve: boolean) => void
  vertical: boolean
  setVertical: (vertical: boolean) => void
  textBehind: boolean
  setTextBehind: (behind: boolean) => void
  resetTextSettings: (character: number) => void
}

export interface StrokeSettings {
  strokeWidth: number
  setStrokeWidth: (width: number) => void
  strokeColor: string
  setStrokeColor: (color: string) => void
  resetStroke: () => void
}

export interface PositionHook {
  position: Position
  setPosition: (position: Position) => void
  moveX: (delta: number) => void
  moveY: (delta: number) => void
}

export interface ColorScheme {
  dominantColor: string
  backgroundColor: string
  textColor: string
  setTextColor: (color: string) => void
  updateColorsFromImage: (imgObj: HTMLImageElement) => void
}

export interface UIState {
  infoOpen: boolean
  setInfoOpen: (open: boolean) => void
  uploadOpen: boolean
  setUploadOpen: (open: boolean) => void
  copyPopupOpen: boolean
  setCopyPopupOpen: (open: boolean) => void
  showCopySuccess: () => void
  downloadPopupOpen: boolean
  setDownloadPopupOpen: (open: boolean) => void
  showDownloadSuccess: () => void
}

export interface CharacterHook {
  character: number
  setCharacter: (character: number) => void
  customImage: string | null
  imgObj: HTMLImageElement | null
  loaded: boolean
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  clearUpload: () => void
}

export interface ExportHooks {
  download: () => Promise<void>
  downloadWebp: () => Promise<void>
  downloadJpg: () => Promise<void>
  copy: () => Promise<void>
  copyWithBg: () => Promise<void>
}
