// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import {
  Grid,
  Button,
  Typography,
  Paper,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  FormControlLabel,
  Switch,
  Slider,
  Divider,
} from '@mui/material'
import { ContentCopyTwoTone, DownloadTwoTone, CloudUpload } from '@mui/icons-material'

export type ExportScale = 1 | 2 | 3

interface ExportPanelProps {
  onCopy: () => void
  onCopyWithBg: () => void
  onDownload: () => void
  onDownloadJpg: () => void
  onDownloadWebp: () => void
  onUpload: () => void
  scale: ExportScale
  onScaleChange: (scale: ExportScale) => void
  quality: number
  onQualityChange: (quality: number) => void
  compress: boolean
  onCompressChange: (compress: boolean) => void
}

/**
 * Panel that groups all export buttons and export settings
 * (scale / quality / compression).
 */
export default function ExportPanel({
  onCopy,
  onCopyWithBg,
  onDownload,
  onDownloadJpg,
  onDownloadWebp,
  onUpload,
  scale,
  onScaleChange,
  quality,
  onQualityChange,
  compress,
  onCompressChange,
}: ExportPanelProps) {
  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        导出选项
      </Typography>
      <Grid container spacing={1}>
        <Grid item xs={6} sm={4} md={6}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<ContentCopyTwoTone />}
            onClick={onCopy}
            fullWidth
          >
            复制 PNG
          </Button>
        </Grid>
        <Grid item xs={6} sm={4} md={6}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<ContentCopyTwoTone />}
            onClick={onCopyWithBg}
            fullWidth
          >
            复制 JPG
          </Button>
        </Grid>
        <Grid item xs={6} sm={4} md={6}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<DownloadTwoTone />}
            onClick={onDownload}
            fullWidth
          >
            保存 PNG
          </Button>
        </Grid>
        <Grid item xs={6} sm={4} md={6}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<DownloadTwoTone />}
            onClick={onDownloadJpg}
            fullWidth
          >
            保存 JPG
          </Button>
        </Grid>
        <Grid item xs={6} sm={4} md={6}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<DownloadTwoTone />}
            onClick={onDownloadWebp}
            fullWidth
          >
            保存 WEBP
          </Button>
        </Grid>
        <Grid item xs={6} sm={4} md={6}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudUpload />}
            onClick={onUpload}
            fullWidth
          >
            上传分享
          </Button>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" gutterBottom>
        导出设置
      </Typography>

      <Box sx={{ mb: 1.5 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          导出尺寸
        </Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          color="secondary"
          value={scale}
          onChange={(_, value: ExportScale | null) => {
            if (value != null) onScaleChange(value)
          }}
          fullWidth
        >
          <ToggleButton value={1}>1×</ToggleButton>
          <ToggleButton value={2}>2×</ToggleButton>
          <ToggleButton value={3}>3×</ToggleButton>
        </ToggleButtonGroup>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          基于当前预览内容放大导出；不会提升底图本身的清晰度
        </Typography>
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={compress}
            onChange={(_, checked) => onCompressChange(checked)}
            color="secondary"
          />
        }
        label="压缩（JPG / WEBP）"
      />

      <Box sx={{ mt: 0.5, opacity: compress ? 1 : 0.45, pointerEvents: compress ? 'auto' : 'none' }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          压缩质量：{quality}%
        </Typography>
        <Slider
          value={quality}
          onChange={(_, v) => onQualityChange(Array.isArray(v) ? v[0] : v)}
          min={10}
          max={100}
          step={1}
          color="secondary"
          valueLabelDisplay="auto"
          valueLabelFormat={(v) => `${v}%`}
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          仅影响 JPG / WEBP；PNG 始终无损。关闭压缩时有损格式使用最高质量。
        </Typography>
      </Box>
    </Paper>
  )
}
