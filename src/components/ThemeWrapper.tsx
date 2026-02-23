// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { useMemo } from 'react'

interface ThemeWrapperProps {
  dominantColor: string
  backgroundColor: string
  children: React.ReactNode
}

export default function ThemeWrapper({ dominantColor, backgroundColor, children }: ThemeWrapperProps) {
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
          MuiSlider: {
            styleOverrides: {
              thumb: {
                color: dominantColor,
              },
              track: {
                color: dominantColor,
              },
            },
          },
          MuiSwitch: {
            styleOverrides: {
              switchBase: {
                '&.Mui-checked': {
                  color: dominantColor,
                },
              },
            },
          },
        },
      }),
    [dominantColor, backgroundColor]
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
