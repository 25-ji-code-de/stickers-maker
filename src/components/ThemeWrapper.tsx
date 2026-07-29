// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { useMemo } from 'react'

function colorChannels(color: string, fallback: string): string {
  const channels = color.match(/[\d.]+/g)?.slice(0, 3)
  return channels?.length === 3 ? channels.join(' ') : fallback
}

interface ThemeWrapperProps {
  dominantColor: string
  backgroundColor: string
  children: React.ReactNode
}

export default function ThemeWrapper({ dominantColor, backgroundColor, children }: ThemeWrapperProps) {
  const accentChannels = colorChannels(dominantColor, '228 194 200')
  const canvasChannels = colorChannels(backgroundColor, '67 60 61')
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'dark',
          primary: {
            main: dominantColor,
          },
          secondary: {
            main: dominantColor,
          },
          background: {
            default: backgroundColor,
            paper: backgroundColor,
          },
          text: {
            primary: dominantColor,
          },
        },
        typography: {
          fontFamily: '"YurukaStd", "SSFangTangTi", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif',
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              ':root': {
                '--sekai-canvas': canvasChannels,
                '--sekai-surface-card': canvasChannels,
                '--sekai-accent': accentChannels,
                '--sekai-fg': accentChannels,
              },
            },
          },
          MuiSlider: {
            styleOverrides: {
              thumb: {
                color: 'rgb(var(--sekai-accent))',
              },
              track: {
                color: 'rgb(var(--sekai-accent))',
              },
            },
          },
          MuiSwitch: {
            styleOverrides: {
              switchBase: {
                '&.Mui-checked': {
                  color: 'rgb(var(--sekai-accent))',
                },
              },
            },
          },
        },
      }),
    [accentChannels, backgroundColor, canvasChannels, dominantColor]
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
