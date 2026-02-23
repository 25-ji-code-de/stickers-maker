// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import { useState, useEffect } from 'react'

export type FontLoadStatus = 'loading' | 'ready' | 'error'

interface FontLoaderResult {
  status: FontLoadStatus
  fontsReady: boolean
  progress: number // 0-100
}

/**
 * Hook to monitor font loading status
 * Tracks when custom fonts are ready for canvas rendering
 */
export function useFontLoader(): FontLoaderResult {
  const [status, setStatus] = useState<FontLoadStatus>('loading')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const fonts = [
      { family: 'YurukaStd', weight: '400' },
      { family: 'SSFangTangTi', weight: '400' },
    ]

    let loadedCount = 0
    const totalFonts = fonts.length

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return 95
        }
        return prev + 5
      })
    }, 200)

    // Load fonts
    const loadFonts = async () => {
      try {
        const promises = fonts.map(async (font) => {
          try {
            await document.fonts.load(`12px ${font.family}`)
            loadedCount++
            const currentProgress = (loadedCount / totalFonts) * 100
            setProgress(currentProgress)
          } catch (err) {
            console.warn(`Failed to load font: ${font.family}`, err)
          }
        })

        await Promise.all(promises)

        // Wait for document.fonts.ready as a final check
        await document.fonts.ready

        clearInterval(progressInterval)
        setProgress(100)
        setStatus('ready')
      } catch (err) {
        console.error('Font loading failed:', err)
        clearInterval(progressInterval)
        setStatus('error')
      }
    }

    loadFonts()

    return () => {
      clearInterval(progressInterval)
    }
  }, [])

  return {
    status,
    fontsReady: status === 'ready',
    progress: Math.min(progress, 100),
  }
}
