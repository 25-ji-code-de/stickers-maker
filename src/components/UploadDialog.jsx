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
import { useState } from 'react'

function UploadDialog({ open, onClose, canvas, altText = '' }) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedUrl, setUploadedUrl] = useState('')
  const [error, setError] = useState('')
  const [selectedTab, setSelectedTab] = useState(0)
  const [copiedFormat, setCopiedFormat] = useState('')

  const uploadToStorage = async () => {
    if (!canvas) return

    setUploading(true)
    setError('')
    setUploadProgress(0)

    try {
      // 将 canvas 转换为 Blob
      const blob = await new Promise((resolve) => {
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
      xhr.send(blob)
    } catch (err) {
      setError(err.message || '上传失败')
      setUploading(false)
    }
  }

  const getLinkFormats = () => {
    if (!uploadedUrl) return {}

    // 使用用户输入的文字，如果是多行则只取第一行，限制长度
    const displayText = altText.split('\n')[0].substring(0, 50) || 'Sekai Sticker'

    return {
      '直链': uploadedUrl,
      'HTML': `<img src="${uploadedUrl}" alt="${displayText}" />`,
      'Markdown': `![${displayText}](${uploadedUrl})`,
      'BBCode': `[img]${uploadedUrl}[/img]`,
      'SEKAI': `[sticker:${uploadedUrl}]`,
      'Forum': `[URL=${uploadedUrl}][IMG]${uploadedUrl}[/IMG][/URL]`,
    }
  }

  const copyToClipboard = async (text, format) => {
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
              上传成功！选择格式复制链接：
            </Alert>

            <Tabs value={selectedTab} onChange={(_, v) => setSelectedTab(v)} sx={{ mb: 2 }}>
              <Tab label="常用格式" />
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
