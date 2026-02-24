// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  TextField,
  Typography,
  LinearProgress,
  IconButton,
  Alert,
  Tabs,
  Tab,
} from '@mui/material'
import { Close, ContentCopy, CloudUpload } from '@mui/icons-material'
import { useState, useEffect } from 'react'
import GallerySubmitForm from './GallerySubmitForm'

interface UploadDialogProps {
  open: boolean
  onClose: () => void
  canvas: HTMLCanvasElement | null
  altText?: string
  onUploadSuccess?: (url: string) => void
  characterId?: number
  customImage?: string | null
}

function UploadDialog({ open, onClose, canvas, altText = '', onUploadSuccess, characterId, customImage }: UploadDialogProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedUrl, setUploadedUrl] = useState('')
  const [error, setError] = useState('')
  const [selectedTab, setSelectedTab] = useState(0)
  const [copiedFormat, setCopiedFormat] = useState('')

  // Reset tab when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedTab(0)
    }
  }, [open])

  const uploadToStorage = async () => {
    if (!canvas) return

    setUploading(true)
    setError('')
    setUploadProgress(0)

    try {
      // 将 canvas 转换为 Blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/png')
      })

      if (!blob) {
        throw new Error('无法生成图片')
      }

      // 生成文件名
      const timestamp = Date.now()
      const filename = `sekai_sticker_${timestamp}.png`

      // 使用 XMLHttpRequest 上传以支持进度
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100)
          setUploadProgress(percent)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText)
            const url = `https://storage.nightcord.de5.net/${result.key}`
            setUploadedUrl(url)
            setUploading(false)
            // Call the success callback
            if (onUploadSuccess) {
              onUploadSuccess(url)
            }
          } catch (e) {
            setError('服务器响应格式错误')
            setUploading(false)
          }
        } else {
          setError(`上传失败: ${xhr.status}`)
          setUploading(false)
        }
      })

      xhr.addEventListener('error', () => {
        setError('网络错误')
        setUploading(false)
      })

      xhr.addEventListener('timeout', () => {
        setError('上传超时')
        setUploading(false)
      })

      xhr.timeout = 30000
      xhr.open('PUT', 'https://storage.nightcord.de5.net')
      xhr.setRequestHeader('X-Filename', encodeURIComponent(filename))
      xhr.setRequestHeader('Content-Type', 'image/png')
      xhr.send(blob as XMLHttpRequestBodyInit)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '上传失败'
      setError(errorMessage)
      setUploading(false)
    }
  }

  const getLinkFormats = () => {
    if (!uploadedUrl) return {}

    // 使用用户输入的文字，如果是多行则只取第一行，限制长度
    const displayText = altText.split('\n')[0].substring(0, 50) || 'Sekai Sticker'

    // 从 URL 中提取 UUID 路径（去除域名部分）
    // 例如：https://storage.nightcord.de5.net/uuid/file.png -> uuid/file.png
    const uuidPath = uploadedUrl.replace(/^https?:\/\/[^\/]+\//, '')

    return {
      '直链': uploadedUrl,
      'HTML': `<img src="${uploadedUrl}" alt="${displayText}" />`,
      'Markdown': `![${displayText}](${uploadedUrl})`,
      'BBCode': `[img]${uploadedUrl}[/img]`,
      'SEKAI': `[sticker:${uploadedUrl}]`,
      'SEKAI v2': `<$SEKAI:Stamp:custom=true:${uuidPath}>`,
      'Forum': `[URL=${uploadedUrl}][IMG]${uploadedUrl}[/IMG][/URL]`,
    }
  }

  const copyToClipboard = async (text: string, format: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedFormat(format)
      setTimeout(() => setCopiedFormat(''), 2000)
    } catch (err) {
      alert('复制失败')
    }
  }

  const handleClose = () => {
    setUploadedUrl('')
    setError('')
    setUploadProgress(0)
    setCopiedFormat('')
    onClose()
  }

  const formats = getLinkFormats()

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">上传并分享</Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {!uploadedUrl && !uploading && (
          <Box textAlign="center" py={3}>
            <Typography variant="body1" gutterBottom>
              上传贴纸到云端，获取分享链接
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<CloudUpload />}
              onClick={uploadToStorage}
              size="large"
              sx={{ mt: 2 }}
            >
              开始上传
            </Button>
          </Box>
        )}

        {uploading && (
          <Box py={3}>
            <Typography variant="body2" gutterBottom align="center">
              上传中... {uploadProgress}%
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress} color="secondary" />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {uploadedUrl && (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              上传成功！选择格式复制链接或提交到画廊：
            </Alert>

            <Tabs value={selectedTab} onChange={(_, v) => setSelectedTab(v)} sx={{ mb: 2 }}>
              <Tab label="常用格式" />
              <Tab label="提交到画廊" />
              <Tab label="预览" />
            </Tabs>

            {selectedTab === 0 && (
              <Box>
                {Object.entries(formats).map(([format, link]) => (
                  <Box key={format} mb={2}>
                    <Typography variant="caption" color="text.secondary">
                      {format}
                    </Typography>
                    <Box display="flex" gap={1} alignItems="center">
                      <TextField
                        fullWidth
                        size="small"
                        value={link}
                        InputProps={{
                          readOnly: true,
                          style: { fontSize: '0.9rem' },
                        }}
                      />
                      <Button
                        variant={copiedFormat === format ? 'contained' : 'outlined'}
                        color="secondary"
                        startIcon={<ContentCopy />}
                        onClick={() => copyToClipboard(link, format)}
                        sx={{ minWidth: '100px' }}
                      >
                        {copiedFormat === format ? '已复制' : '复制'}
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            {selectedTab === 1 && (
              <GallerySubmitForm
                uploadedUrl={uploadedUrl}
                defaultTitle={altText}
                defaultCharacterId={customImage ? undefined : characterId}
                onSuccess={() => {
                  // Keep dialog open to show success message
                }}
              />
            )}

            {selectedTab === 2 && (
              <Box textAlign="center" py={2}>
                <img
                  src={uploadedUrl}
                  alt="Uploaded Sticker"
                  style={{ maxWidth: '100%', border: '1px solid #444', borderRadius: '4px' }}
                />
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default UploadDialog
