// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

export interface ContentBounds {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Find the bounding box of non-transparent pixels on a canvas.
 * Returns null when the canvas is fully transparent.
 */
export function getContentBounds(
  canvas: HTMLCanvasElement,
  alphaThreshold: number = 0
): ContentBounds | null {
  // Do not pass contextAttributes here: the preview canvas already has a 2d
  // context; re-requesting with different attributes can return null.
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const { width, height } = canvas
  if (width === 0 || height === 0) return null

  const { data } = ctx.getImageData(0, 0, width, height)

  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1

  for (let y = 0; y < height; y++) {
    const row = y * width * 4
    for (let x = 0; x < width; x++) {
      if (data[row + x * 4 + 3] > alphaThreshold) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  if (maxX < minX || maxY < minY) return null

  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  }
}

/**
 * Create a new canvas cropped to non-transparent content.
 * Falls back to a full copy when content fills the canvas or is empty.
 */
export function cropCanvasToContent(
  source: HTMLCanvasElement,
  alphaThreshold: number = 0
): HTMLCanvasElement {
  const bounds = getContentBounds(source, alphaThreshold)
  const cropped = document.createElement('canvas')

  if (!bounds || (bounds.width === source.width && bounds.height === source.height)) {
    cropped.width = source.width
    cropped.height = source.height
    const ctx = cropped.getContext('2d')
    if (ctx) ctx.drawImage(source, 0, 0)
    return cropped
  }

  cropped.width = bounds.width
  cropped.height = bounds.height
  const ctx = cropped.getContext('2d')
  if (ctx) {
    ctx.drawImage(
      source,
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      0,
      0,
      bounds.width,
      bounds.height
    )
  }
  return cropped
}

/**
 * Draw source onto a new canvas with an opaque white background.
 * Useful for JPEG export / clipboard with white fill.
 */
export function canvasWithWhiteBackground(source: HTMLCanvasElement): HTMLCanvasElement {
  const out = document.createElement('canvas')
  out.width = source.width
  out.height = source.height
  const ctx = out.getContext('2d')
  if (ctx) {
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, out.width, out.height)
    ctx.drawImage(source, 0, 0)
  }
  return out
}

/**
 * Scale a canvas by an integer/float factor using high-quality smoothing.
 * scale <= 1 returns the same canvas reference (no copy) for the common 1x path.
 */
export function scaleCanvas(source: HTMLCanvasElement, scale: number): HTMLCanvasElement {
  if (!Number.isFinite(scale) || scale <= 0 || scale === 1) {
    return source
  }

  const out = document.createElement('canvas')
  out.width = Math.max(1, Math.round(source.width * scale))
  out.height = Math.max(1, Math.round(source.height * scale))
  const ctx = out.getContext('2d')
  if (ctx) {
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(source, 0, 0, out.width, out.height)
  }
  return out
}

/**
 * Crop transparent padding then optionally scale for export.
 */
export function prepareExportCanvas(
  source: HTMLCanvasElement,
  scale: number = 1
): HTMLCanvasElement {
  return scaleCanvas(cropCanvasToContent(source), scale)
}
