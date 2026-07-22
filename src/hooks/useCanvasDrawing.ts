// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import { useCallback } from 'react'
import { Position, FontKey } from '../types'

const FONT_STACKS: Record<FontKey, string> = {
  yuruka: 'YurukaStd, SSFangTangTi, sans-serif',
  fangtang: 'SSFangTangTi, sans-serif',
  system:
    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
}

/** Logical (CSS) size of the sticker canvas at 1× */
export const CANVAS_WIDTH = 296
export const CANVAS_HEIGHT = 256

/** Magic offset used in vertical line step: fontSize + spaceSize - VERTICAL_LINE_GAP */
const VERTICAL_LINE_GAP = 40

interface TextSettings {
  fontSize: number
  fontKey: FontKey
  spaceSize: number
  letterSpacing: number
  curve: boolean
  vertical: boolean
}

interface Colors {
  textColor: string
}

interface Stroke {
  strokeWidth: number
  strokeColor: string
}

/**
 * Hook that encapsulates all canvas drawing logic.
 * Pass `scale` > 1 for high-DPI export: layout is multiplied so text/strokes
 * are re-rasterized at higher resolution instead of upscaling a bitmap.
 */
export function useCanvasDrawing() {
  const drawText = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      text: string,
      position: Position,
      rotate: number,
      textSettings: TextSettings,
      colors: Colors,
      stroke: Stroke,
      angle: number,
      /** Scale factor applied to the fixed vertical line-gap constant */
      scale: number = 1
    ): void => {
      const { fontSize, fontKey, spaceSize, letterSpacing, curve, vertical } = textSettings
      const { textColor } = colors
      const { strokeWidth, strokeColor } = stroke

      ctx.font = `${fontSize}px ${FONT_STACKS[fontKey]}`
      ctx.lineWidth = strokeWidth
      ctx.save()

      ctx.translate(position.x, position.y)
      ctx.rotate(rotate / 10)
      ctx.textAlign = 'center'
      ctx.strokeStyle = strokeColor
      ctx.fillStyle = textColor
      const lines = text.split('\n')

      if (curve) {
        for (let line of lines) {
          for (let i = 0; i < line.length; i++) {
            ctx.rotate(angle / line.length / 2.5)
            ctx.save()
            ctx.translate(0, -1 * fontSize * 3.5)
            ctx.strokeText(line[i], 0, 0)
            ctx.fillText(line[i], 0, 0)
            ctx.restore()
          }
        }
      } else if (vertical) {
        const letterStep = fontSize + letterSpacing
        const lineStep = fontSize + spaceSize - VERTICAL_LINE_GAP * scale
        let xOffset = 0
        for (const line of lines) {
          let yOffset = 0
          for (let i = 0; i < line.length; i++) {
            ctx.strokeText(line[i], xOffset, yOffset)
            ctx.fillText(line[i], xOffset, yOffset)
            yOffset += letterStep
          }
          xOffset += lineStep
        }
      } else {
        if (letterSpacing === 0) {
          for (let i = 0, k = 0; i < lines.length; i++) {
            ctx.strokeText(lines[i], 0, k)
            ctx.fillText(lines[i], 0, k)
            k += spaceSize
          }
        } else {
          ctx.textAlign = 'left'
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            const lineY = i * spaceSize
            const metrics = ctx.measureText(line)
            let charX = -metrics.width / 2
            for (let j = 0; j < line.length; j++) {
              ctx.strokeText(line[j], charX, lineY)
              ctx.fillText(line[j], charX, lineY)
              const charMetrics = ctx.measureText(line[j])
              charX += charMetrics.width + letterSpacing
            }
          }
          ctx.textAlign = 'center'
        }
      }
      ctx.restore()
    },
    []
  )

  const draw = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      imgObj: HTMLImageElement | null,
      loaded: boolean,
      text: string,
      position: Position,
      rotate: number,
      textSettings: TextSettings,
      colors: Colors,
      stroke: Stroke,
      textBehind: boolean,
      /**
       * Pixel scale for export (1 = preview size).
       * Text / stroke / positions are re-drawn at this density — not bitmap-upscaled.
       */
      scale: number = 1
    ): void => {
      const s = Number.isFinite(scale) && scale > 0 ? scale : 1
      const w = Math.round(CANVAS_WIDTH * s)
      const h = Math.round(CANVAS_HEIGHT * s)
      if (ctx.canvas.width !== w) ctx.canvas.width = w
      if (ctx.canvas.height !== h) ctx.canvas.height = h

      ctx.clearRect(0, 0, w, h)

      if (loaded && imgObj && document.fonts.check('12px YurukaStd')) {
        const img = imgObj

        const hRatio = w / img.width
        const vRatio = h / img.height
        const ratio = Math.min(hRatio, vRatio)
        const centerShift_x = (w - img.width * ratio) / 2
        const centerShift_y = (h - img.height * ratio) / 2

        const angle = (Math.PI * text.length) / 7

        // Scale layout so geometry matches 1× preview, at higher pixel density
        const scaledPosition = { x: position.x * s, y: position.y * s }
        const scaledTextSettings: TextSettings = {
          ...textSettings,
          fontSize: textSettings.fontSize * s,
          spaceSize: textSettings.spaceSize * s,
          letterSpacing: textSettings.letterSpacing * s,
        }
        const scaledStroke: Stroke = {
          strokeWidth: stroke.strokeWidth * s,
          strokeColor: stroke.strokeColor,
        }

        if (textBehind) {
          drawText(
            ctx,
            text,
            scaledPosition,
            rotate,
            scaledTextSettings,
            colors,
            scaledStroke,
            angle,
            s
          )
        }

        // drawImage uses full source pixels; if the asset is low-res it still
        // cannot invent detail, but text below is re-rasterized sharply.
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          centerShift_x,
          centerShift_y,
          img.width * ratio,
          img.height * ratio
        )

        if (!textBehind) {
          drawText(
            ctx,
            text,
            scaledPosition,
            rotate,
            scaledTextSettings,
            colors,
            scaledStroke,
            angle,
            s
          )
        }
      } else {
        // 空状态 - 显示渐变背景
        const gradient = ctx.createLinearGradient(0, 0, w, h)
        gradient.addColorStop(0, '#2a2a2a')
        gradient.addColorStop(1, '#1a1a1a')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, w, h)
      }
    },
    [drawText]
  )

  return {
    draw,
    drawText,
  }
}
