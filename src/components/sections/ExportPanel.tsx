// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import { Grid, Button, Typography, Paper } from '@mui/material'
import { ContentCopyTwoTone, DownloadTwoTone, CloudUpload } from '@mui/icons-material'

interface ExportPanelProps {
  onCopy: () => void
  onCopyWithBg: () => void
  onDownload: () => void
  onDownloadJpg: () => void
  onDownloadWebp: () => void
  onUpload: () => void
}

/**
 * Panel that groups all export buttons
 */
export default function ExportPanel({
  onCopy,
  onCopyWithBg,
  onDownload,
  onDownloadJpg,
  onDownloadWebp,
  onUpload,
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
    </Paper>
  )
}
