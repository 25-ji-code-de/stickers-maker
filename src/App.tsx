// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import {
  Typography,
  Grid,
  Button,
  Box,
  Paper,
  IconButton,
  Tooltip,
  Divider,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  GitHub,
  InfoOutlined,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  KeyboardArrowUp,
  KeyboardArrowDown,
  History,
  Undo,
  Redo,
} from '@mui/icons-material'
import { useCallback, useEffect, useRef, lazy, Suspense } from 'react'
import characters from './characters.json'
import Canvas from './components/Canvas'
import Picker from './components/Picker'
import ThemeWrapper from './components/ThemeWrapper'
import NotificationSnackbar from './components/controls/NotificationSnackbar'
import TextStylePanel from './components/sections/TextStylePanel'
import ExportPanel from './components/sections/ExportPanel'

// Lazy load heavy dialog components
const Info = lazy(() => import('./components/Info'))
const UploadDialog = lazy(() => import('./components/UploadDialog'))
const HistoryPanel = lazy(() => import('./components/sections/HistoryPanel'))
const PWAUpdatePrompt = lazy(() => import('./components/PWAUpdatePrompt'))

import { useCharacter } from './hooks/useCharacter'
import { useColorScheme } from './hooks/useColorScheme'
import { useTextSettings } from './hooks/useTextSettings'
import { usePosition } from './hooks/usePosition'
import { useStroke } from './hooks/useStroke'
import { useCanvasDrawing } from './hooks/useCanvasDrawing'
import { useExport } from './hooks/useExport'
import { useUIState } from './hooks/useUIState'
import { useHistory } from './hooks/useHistory'
import { useFontLoader } from './hooks/useFontLoader'
import { useUndoRedo } from './hooks/useUndoRedo'
import { StickerConfig } from './types'
import FontLoadingOverlay from './components/FontLoadingOverlay'

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize hooks
  const uiState = useUIState()

  // Character hook needs a callback to update colors when image loads
  const colorScheme = useColorScheme(49) // Initial character

  // Use useCallback to stabilize the onImageLoad callback
  const handleImageLoad = useCallback((img: HTMLImageElement) => {
    colorScheme.updateColorsFromImage(img)
  }, [colorScheme.updateColorsFromImage])

  const characterHook = useCharacter(fileInputRef, handleImageLoad)

  const textSettings = useTextSettings(characterHook.character)
  const position = usePosition(
    characters[characterHook.character].defaultText.x,
    characters[characterHook.character].defaultText.y
  )
  const stroke = useStroke()
  const canvasDrawing = useCanvasDrawing()

  const exportHooks = useExport(
    canvasRef,
    characterHook.character,
    textSettings.text,
    uiState.setCopyPopupOpen,
    uiState.setDownloadPopupOpen
  )

  const history = useHistory()

  // Undo/Redo hook
  const undoRedo = useUndoRedo()
  const isRestoringState = useRef<boolean>(false)

  // Monitor font loading status
  const { fontsReady, progress: fontProgress } = useFontLoader()

  // Update text settings and position when character changes
  useEffect(() => {
    const char = characters[characterHook.character]
    textSettings.resetTextSettings(characterHook.character)
    position.setPosition({
      x: char.defaultText.x,
      y: char.defaultText.y,
    })
    colorScheme.setTextColor(char.color)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterHook.character])

  // Canvas drawing callback
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      canvasDrawing.draw(
        ctx,
        characterHook.imgObj,
        characterHook.loaded,
        textSettings.text,
        position.position,
        textSettings.rotate,
        {
          fontSize: textSettings.fontSize,
          fontKey: textSettings.fontKey,
          spaceSize: textSettings.spaceSize,
          letterSpacing: textSettings.letterSpacing,
          curve: textSettings.curve,
          vertical: textSettings.vertical,
        },
        {
          textColor: colorScheme.textColor,
        },
        {
          strokeWidth: stroke.strokeWidth,
          strokeColor: stroke.strokeColor,
        },
        textSettings.textBehind
      )
    },
    [
      canvasDrawing,
      characterHook.imgObj,
      characterHook.loaded,
      textSettings,
      position.position,
      colorScheme.textColor,
      stroke,
    ]
  )

  // Reset all settings
  const resetSettings = () => {
    textSettings.resetTextSettings(characterHook.character)
    position.setPosition({
      x: characters[characterHook.character].defaultText.x,
      y: characters[characterHook.character].defaultText.y,
    })
    stroke.resetStroke()
    colorScheme.setTextColor(characters[characterHook.character].color)
  }

  const handleCharacterSelect = (index: number) => {
    characterHook.setCharacter(index)
  }

  // Get current configuration
  const getCurrentConfig = useCallback((): StickerConfig => {
    return {
      character: characterHook.character,
      customImage: characterHook.customImage,
      text: textSettings.text,
      fontSize: textSettings.fontSize,
      fontKey: textSettings.fontKey,
      position: position.position,
      rotate: textSettings.rotate,
      spaceSize: textSettings.spaceSize,
      letterSpacing: textSettings.letterSpacing,
      strokeWidth: stroke.strokeWidth,
      strokeColor: stroke.strokeColor,
      textColor: colorScheme.textColor,
      curve: textSettings.curve,
      vertical: textSettings.vertical,
      textBehind: textSettings.textBehind,
    }
  }, [
    characterHook.character,
    characterHook.customImage,
    textSettings,
    position.position,
    stroke,
    colorScheme.textColor,
  ])

  // Save current sticker to history (with auto-deduplication)
  const saveToHistory = useCallback((uploadedUrl?: string) => {
    if (!canvasRef.current) return

    const config = getCurrentConfig()
    history.addHistory(config, canvasRef.current, uploadedUrl)
  }, [getCurrentConfig, history])

  // Wrap export functions to auto-save to history
  const handleDownload = useCallback(async () => {
    await exportHooks.download()
    saveToHistory()
  }, [exportHooks, saveToHistory])

  const handleDownloadWebp = useCallback(async () => {
    await exportHooks.downloadWebp()
    saveToHistory()
  }, [exportHooks, saveToHistory])

  const handleDownloadJpg = useCallback(async () => {
    await exportHooks.downloadJpg()
    saveToHistory()
  }, [exportHooks, saveToHistory])

  const handleCopy = useCallback(async () => {
    await exportHooks.copy()
    saveToHistory()
  }, [exportHooks, saveToHistory])

  const handleCopyWithBg = useCallback(async () => {
    await exportHooks.copyWithBg()
    saveToHistory()
  }, [exportHooks, saveToHistory])

  // Load configuration from history
  const loadFromHistory = useCallback((id: string) => {
    const config = history.loadHistory(id)
    if (!config) return

    // Apply all settings
    characterHook.setCharacter(config.character)
    textSettings.setText(config.text)
    textSettings.setFontSize(config.fontSize)
    textSettings.setFontKey(config.fontKey)
    textSettings.setRotate(config.rotate)
    textSettings.setSpaceSize(config.spaceSize)
    textSettings.setLetterSpacing(config.letterSpacing)
    textSettings.setCurve(config.curve)
    textSettings.setVertical(config.vertical)
    textSettings.setTextBehind(config.textBehind)
    position.setPosition(config.position)
    stroke.setStrokeWidth(config.strokeWidth)
    stroke.setStrokeColor(config.strokeColor)
    colorScheme.setTextColor(config.textColor)

    // Handle custom image if present
    if (config.customImage && config.customImage !== characterHook.customImage) {
      // Note: Custom images are stored as data URLs, so they can be restored
      // This is handled automatically by the character hook
    }
  }, [history, characterHook, textSettings, position, stroke, colorScheme])

  // Apply configuration (used by both history and undo/redo)
  const applyConfig = useCallback((config: StickerConfig) => {
    isRestoringState.current = true

    characterHook.setCharacter(config.character)
    textSettings.setText(config.text)
    textSettings.setFontSize(config.fontSize)
    textSettings.setFontKey(config.fontKey)
    textSettings.setRotate(config.rotate)
    textSettings.setSpaceSize(config.spaceSize)
    textSettings.setLetterSpacing(config.letterSpacing)
    textSettings.setCurve(config.curve)
    textSettings.setVertical(config.vertical)
    textSettings.setTextBehind(config.textBehind)
    position.setPosition(config.position)
    stroke.setStrokeWidth(config.strokeWidth)
    stroke.setStrokeColor(config.strokeColor)
    colorScheme.setTextColor(config.textColor)

    setTimeout(() => {
      isRestoringState.current = false
    }, 100)
  }, [characterHook, textSettings, position, stroke, colorScheme])

  // Push current state to undo/redo stack when any setting changes (with debounce)
  useEffect(() => {
    if (isRestoringState.current) return

    // Debounce: wait 500ms after the last change before recording
    const timeoutId = setTimeout(() => {
      const config = getCurrentConfig()
      undoRedo.pushState(config)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [
    characterHook.character,
    textSettings.text,
    textSettings.fontSize,
    textSettings.fontKey,
    textSettings.rotate,
    textSettings.spaceSize,
    textSettings.letterSpacing,
    textSettings.curve,
    textSettings.vertical,
    textSettings.textBehind,
    position.position,
    stroke.strokeWidth,
    stroke.strokeColor,
    colorScheme.textColor,
    getCurrentConfig,
    undoRedo,
  ])

  // Handle undo
  const handleUndo = useCallback(() => {
    const previousState = undoRedo.undo()
    if (previousState) {
      applyConfig(previousState)
    }
  }, [undoRedo, applyConfig])

  // Handle redo
  const handleRedo = useCallback(() => {
    const nextState = undoRedo.redo()
    if (nextState) {
      applyConfig(nextState)
    }
  }, [undoRedo, applyConfig])

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      }
      // Ctrl+Y or Cmd+Y or Ctrl+Shift+Z for redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        handleRedo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleUndo, handleRedo])

  return (
    <ThemeWrapper dominantColor={colorScheme.dominantColor} backgroundColor={colorScheme.backgroundColor}>
      <Box sx={{ minHeight: '100vh', width: '100%', px: { xs: 1.5, sm: 3 }, py: 3 }}>
        <Grid container spacing={3}>
          {/* Header */}
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  fontSize: { sm: '2.5rem', md: '3rem' },
                  fontWeight: 'bold',
                  color: colorScheme.dominantColor,
                }}
              >Project Sekai 贴纸生成器</Typography>
              {/* Desktop buttons */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                <Tooltip title="撤销 (Ctrl+Z)">
                  <span>
                    <IconButton
                      color="secondary"
                      onClick={handleUndo}
                      disabled={!undoRedo.canUndo}
                    >
                      <Undo />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="重做 (Ctrl+Y)">
                  <span>
                    <IconButton
                      color="secondary"
                      onClick={handleRedo}
                      disabled={!undoRedo.canRedo}
                    >
                      <Redo />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="历史记录">
                  <IconButton color="secondary" onClick={() => uiState.setHistoryOpen(true)}>
                    <History />
                  </IconButton>
                </Tooltip>
                <Tooltip title="关于">
                  <IconButton color="secondary" onClick={() => uiState.setInfoOpen(true)}>
                    <InfoOutlined />
                  </IconButton>
                </Tooltip>
                <Tooltip title="GitHub">
                  <IconButton
                    color="secondary"
                    href="https://github.com/25-ji-code-de/stickers-maker"
                    target="_blank"
                  >
                    <GitHub />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Grid>

          {/* Canvas Section */}
          <Grid item xs={12} md={5}>
            <Paper elevation={3} sx={{ p: 2 }}>
              {/* Canvas - mobile and desktop */}
              <Box display="flex" gap={2} justifyContent="center">
                {/* Left: Canvas and horizontal slider */}
                <Box display="flex" flexDirection="column">
                  {/* Canvas container - responsive size, maintains 296:256 ratio */}
                  <Box
                    sx={{
                      width: { xs: '237px', md: '296px' },
                      height: { xs: '205px', md: '256px' },
                      position: 'relative',
                    }}
                  >
                    <Canvas
                      ref={canvasRef}
                      draw={draw}
                      style={{
                        border: '1px solid #444',
                        display: 'block',
                        width: '100%',
                        height: '100%',
                      }}
                    />

                    {/* Font loading overlay */}
                    {!fontsReady && (
                      <FontLoadingOverlay progress={fontProgress} />
                    )}
                  </Box>

                  {/* Mobile: Horizontal slider */}
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    mt={1}
                    sx={{ display: { xs: 'flex', md: 'none' }, height: '50px' }}
                  >
                    <IconButton size="small" onClick={() => position.moveX(-5)}>
                      <KeyboardArrowLeft />
                    </IconButton>
                    <Box flex={1} display="flex" alignItems="center">
                      <Slider
                        value={position.position.x}
                        onChange={(_, v) => position.setPosition({ ...position.position, x: Array.isArray(v) ? v[0] : v })}
                        min={0}
                        max={296}
                        color="secondary"
                        sx={{ width: '100%' }}
                      />
                    </Box>
                    <IconButton size="small" onClick={() => position.moveX(5)}>
                      <KeyboardArrowRight />
                    </IconButton>
                  </Box>
                </Box>

                {/* Mobile: Right side vertical slider and Picker */}
                <Box display="flex" flexDirection="column" sx={{ display: { xs: 'flex', md: 'none' } }}>
                  {/* Vertical slider - height matches Canvas */}
                  <Box display="flex" flexDirection="column" alignItems="center" sx={{ height: '205px' }}>
                    <IconButton size="small" onClick={() => position.moveY(-5)}>
                      <KeyboardArrowUp />
                    </IconButton>
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      <Slider
                        orientation="vertical"
                        value={256 - position.position.y}
                        onChange={(_, v) => position.setPosition({ ...position.position, y: 256 - (Array.isArray(v) ? v[0] : v) })}
                        min={0}
                        max={256}
                        color="secondary"
                        sx={{ height: '100%' }}
                      />
                    </Box>
                    <IconButton size="small" onClick={() => position.moveY(5)}>
                      <KeyboardArrowDown />
                    </IconButton>
                  </Box>

                  {/* Picker button - aligns with horizontal slider */}
                  <Box display="flex" alignItems="center" justifyContent="center" mt={1} sx={{ height: '50px' }}>
                    <Picker setCharacter={handleCharacterSelect} color={colorScheme.dominantColor} />
                  </Box>
                </Box>
              </Box>

              {/* Desktop: Control buttons and sliders */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Box display="flex" gap={1} mb={1} mt={2}>
                  <Box display="flex" gap={0.5} flex={1}>
                    <Button size="small" onClick={() => position.moveX(-5)} fullWidth startIcon={<KeyboardArrowLeft />}>
                      X-5
                    </Button>
                    <Button size="small" onClick={() => position.moveX(5)} fullWidth endIcon={<KeyboardArrowRight />}>
                      X+5
                    </Button>
                  </Box>
                  <Box display="flex" gap={0.5} flex={1}>
                    <Button size="small" onClick={() => position.moveY(-5)} fullWidth startIcon={<KeyboardArrowUp />}>
                      Y-5
                    </Button>
                    <Button size="small" onClick={() => position.moveY(5)} fullWidth endIcon={<KeyboardArrowDown />}>
                      Y+5
                    </Button>
                  </Box>
                </Box>

                <Typography variant="body2" gutterBottom>
                  水平位置: {position.position.x}
                </Typography>
                <Slider
                  value={position.position.x}
                  onChange={(_, v) => position.setPosition({ ...position.position, x: Array.isArray(v) ? v[0] : v })}
                  min={0}
                  max={296}
                  color="secondary"
                />

                <Typography variant="body2" gutterBottom>
                  垂直位置: {position.position.y}
                </Typography>
                <Slider
                  value={position.position.y}
                  onChange={(_, v) => position.setPosition({ ...position.position, y: Array.isArray(v) ? v[0] : v })}
                  min={0}
                  max={256}
                  color="secondary"
                />
              </Box>
            </Paper>
          </Grid>

          {/* Controls Section */}
          <Grid item xs={12} md={7}>
            <Paper elevation={3} sx={{ p: 2 }}>
              {/* Desktop: display Picker and character name */}
              <Box display="flex" alignItems="center" gap={1} mb={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
                <Picker setCharacter={handleCharacterSelect} color={colorScheme.dominantColor} />
                <Typography
                  variant="subtitle1"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1
                  }}
                >
                  {characters[characterHook.character].name}
                </Typography>
              </Box>

              <TextStylePanel
                character={characterHook.character}
                text={textSettings.text}
                setText={textSettings.setText}
                fontSize={textSettings.fontSize}
                setFontSize={textSettings.setFontSize}
                rotate={textSettings.rotate}
                setRotate={textSettings.setRotate}
                spaceSize={textSettings.spaceSize}
                setSpaceSize={textSettings.setSpaceSize}
                letterSpacing={textSettings.letterSpacing}
                setLetterSpacing={textSettings.setLetterSpacing}
                strokeWidth={stroke.strokeWidth}
                setStrokeWidth={stroke.setStrokeWidth}
                fontKey={textSettings.fontKey}
                setFontKey={textSettings.setFontKey}
                textColor={colorScheme.textColor}
                setTextColor={colorScheme.setTextColor}
                strokeColor={stroke.strokeColor}
                setStrokeColor={stroke.setStrokeColor}
                curve={textSettings.curve}
                setCurve={textSettings.setCurve}
                vertical={textSettings.vertical}
                setVertical={textSettings.setVertical}
                textBehind={textSettings.textBehind}
                setTextBehind={textSettings.setTextBehind}
              />

              <Divider sx={{ my: 2 }} />

              <Box mt={2}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                  onChange={characterHook.handleUpload}
                  style={{ display: 'none' }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ mr: 1 }}
                >
                  上传自定义图片
                </Button>
                {characterHook.customImage && (
                  <Button variant="outlined" size="small" onClick={characterHook.clearUpload}>
                    清除自定义图片
                  </Button>
                )}
              </Box>

              <Box mt={2}>
                <Button variant="contained" color="secondary" onClick={resetSettings} fullWidth>
                  重置所有设置
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Export Section */}
          <Grid item xs={12}>
            <ExportPanel
              onCopy={handleCopy}
              onCopyWithBg={handleCopyWithBg}
              onDownload={handleDownload}
              onDownloadJpg={handleDownloadJpg}
              onDownloadWebp={handleDownloadWebp}
              onUpload={() => uiState.setUploadOpen(true)}
            />
          </Grid>
        </Grid>

        {/* Mobile bottom button area */}
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 1.5,
            mt: 3,
            pb: 2,
          }}
        >
          <Tooltip title="撤销">
            <span>
              <IconButton
                color="secondary"
                onClick={handleUndo}
                disabled={!undoRedo.canUndo}
                sx={{ border: '1px solid rgba(228, 194, 200, 0.5)' }}
              >
                <Undo />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="重做">
            <span>
              <IconButton
                color="secondary"
                onClick={handleRedo}
                disabled={!undoRedo.canRedo}
                sx={{ border: '1px solid rgba(228, 194, 200, 0.5)' }}
              >
                <Redo />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="历史记录">
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<History />}
              onClick={() => uiState.setHistoryOpen(true)}
            >
              历史
            </Button>
          </Tooltip>
          <Tooltip title="关于">
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<InfoOutlined />}
              onClick={() => uiState.setInfoOpen(true)}
            >
              关于
            </Button>
          </Tooltip>
          <Tooltip title="GitHub">
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<GitHub />}
              href="https://github.com/25-ji-code-de/stickers-maker"
              target="_blank"
            >
              GitHub
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* Dialogs - Lazy loaded with Suspense */}
      <Suspense fallback={null}>
        <Info open={uiState.infoOpen} handleClose={() => uiState.setInfoOpen(false)} />
      </Suspense>

      <Suspense fallback={null}>
        <Dialog
          open={uiState.historyOpen}
          onClose={() => uiState.setHistoryOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>历史记录</DialogTitle>
          <DialogContent>
            <HistoryPanel
              historyItems={history.historyItems}
              onLoadHistory={(id) => {
                loadFromHistory(id)
                uiState.setHistoryOpen(false)
              }}
              onDeleteHistory={history.deleteHistory}
              onClearHistory={history.clearHistory}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => uiState.setHistoryOpen(false)}>关闭</Button>
          </DialogActions>
        </Dialog>
      </Suspense>

      <Suspense fallback={null}>
        <UploadDialog
          open={uiState.uploadOpen}
          onClose={() => uiState.setUploadOpen(false)}
          canvas={canvasRef.current}
          altText={textSettings.text}
          onUploadSuccess={(url) => saveToHistory(url)}
        />
      </Suspense>

      {/* Notifications */}
      <NotificationSnackbar
        open={uiState.copyPopupOpen}
        message="已复制到剪贴板！"
        onClose={() => uiState.setCopyPopupOpen(false)}
      />
      <NotificationSnackbar
        open={uiState.downloadPopupOpen}
        message="下载成功！"
        onClose={() => uiState.setDownloadPopupOpen(false)}
      />

      {/* PWA Update Prompt */}
      <Suspense fallback={null}>
        <PWAUpdatePrompt />
      </Suspense>
    </ThemeWrapper>
  )
}

export default App
