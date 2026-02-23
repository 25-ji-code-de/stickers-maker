// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import { Box, Typography } from '@mui/material'

interface FontLoadingOverlayProps {
  progress: number
}

export default function FontLoadingOverlay({ progress }: FontLoadingOverlayProps) {
  // 当进度超过 90% 时，角标淡出（用户不需要盯着最后 10%）
  const showBadge = progress < 90

  return (
    <>
      {/* 方案 F: 顶部线性进度条 - 始终显示 */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          bgcolor: 'rgba(228, 194, 200, 0.2)',
          overflow: 'hidden',
          zIndex: 10,
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, rgb(228, 194, 200), rgba(228, 194, 200, 0.8))',
            transition: 'width 0.3s ease-out',
            boxShadow: '0 0 10px rgba(228, 194, 200, 0.5)',
          }}
        />
      </Box>

      {/* 方案 B: 右下角徽章 - 进度 < 90% 时显示 */}
      {showBadge && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 0.8,
            bgcolor: 'rgb(67, 60, 61)',
            color: 'rgb(228, 194, 200)',
            px: 1.5,
            py: 0.7,
            borderRadius: 2,
            fontSize: '0.75rem',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(67, 60, 61, 0.6)',
            zIndex: 10,
            animation: 'fadeIn 0.3s ease-out',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'scale(0.9)' },
              to: { opacity: 1, transform: 'scale(1)' },
            },
          }}
        >
          {/* Spinner */}
          <Box
            sx={{
              width: 12,
              height: 12,
              border: '2px solid rgba(228, 194, 200, 0.3)',
              borderTopColor: 'rgb(228, 194, 200)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              '@keyframes spin': {
                to: { transform: 'rotate(360deg)' },
              },
            }}
          />
          <Typography component="span" sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}>
            {Math.round(progress)}%
          </Typography>
        </Box>
      )}
    </>
  )
}
