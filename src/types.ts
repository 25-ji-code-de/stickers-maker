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
  historyOpen: boolean
  setHistoryOpen: (open: boolean) => void
  resetConfirmOpen: boolean
  setResetConfirmOpen: (open: boolean) => void
  shortcutsHelpOpen: boolean
  setShortcutsHelpOpen: (open: boolean) => void
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

/**
 * Configuration snapshot for history
 */
export interface StickerConfig {
  character: number
  customImage: string | null
  text: string
  fontSize: number
  fontKey: FontKey
  position: Position
  rotate: number
  spaceSize: number
  letterSpacing: number
  strokeWidth: number
  strokeColor: string
  textColor: string
  curve: boolean
  vertical: boolean
  textBehind: boolean
}

/**
 * History item stored in localStorage
 */
export interface HistoryItem {
  id: string
  timestamp: number
  thumbnail: string // base64 image data URL
  config: StickerConfig
  uploadedUrl?: string
}

/**
 * Hook for managing history
 */
export interface HistoryHook {
  historyItems: HistoryItem[]
  addHistory: (config: StickerConfig, canvas: HTMLCanvasElement, uploadedUrl?: string) => void
  loadHistory: (id: string) => StickerConfig | null
  deleteHistory: (id: string) => void
  clearHistory: () => void
}

/**
 * Keyboard shortcut item
 */
export interface ShortcutItem {
  keys: string[]
  description: string
}

/**
 * Keyboard shortcut category
 */
export interface ShortcutCategory {
  name: string
  shortcuts: ShortcutItem[]
}

/**
 * Configuration for keyboard shortcuts hook
 */
export interface KeyboardShortcutsConfig {
  // Export operations
  handleCopy: () => void
  handleCopyWithBg: () => void
  handleDownload: () => void
  handleDownloadJpg: () => void
  handleDownloadWebp: () => void

  // Undo/redo
  handleUndo: () => void
  handleRedo: () => void

  // Position
  position: PositionHook

  // Style
  fontSize: number
  setFontSize: (size: number) => void
  letterSpacing: number
  setLetterSpacing: (spacing: number) => void
  spaceSize: number
  setSpaceSize: (size: number) => void
  rotate: number
  setRotate: (rotate: number) => void

  // Toggles
  curve: boolean
  setCurve: (curve: boolean) => void
  vertical: boolean
  setVertical: (vertical: boolean) => void
  textBehind: boolean
  setTextBehind: (behind: boolean) => void

  // UI state
  uiState: UIState
}

/**
 * Return type for keyboard shortcuts hook
 */
export interface UseKeyboardShortcutsReturn {
  isInputFocused: boolean
  shortcutsEnabled: boolean
}

/**
 * History sorting type
 */
export type HistorySortType = 'newest' | 'oldest' | 'uploaded-first'

/**
 * Time range filter for history
 */
export type TimeRangeFilter = 'all' | 'today' | 'week' | 'month' | 'earlier'

/**
 * Upload status filter for history
 */
export type UploadStatusFilter = 'all' | 'uploaded' | 'not-uploaded'

/**
 * Complete filter state for history
 */
export interface HistoryFilters {
  searchText: string
  sortType: HistorySortType
  uploadStatus: UploadStatusFilter
  timeRange: TimeRangeFilter
}
