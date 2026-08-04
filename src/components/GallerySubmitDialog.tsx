// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material'
import { useState, useEffect } from 'react'
import { HistoryItem, GalleryItem, GalleryManifest } from '../types'
import { useAuth } from '../hooks/useAuth'
import { fetchGalleryManifest, uploadGalleryManifest } from '../utils/galleryUtils'
import GallerySubmitFields from './GallerySubmitFields'

interface GallerySubmitDialogProps {
  open: boolean
  onClose: () => void
  historyItem: HistoryItem | null
}

export default function GallerySubmitDialog({
  open,
  onClose,
  historyItem,
}: GallerySubmitDialogProps) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [characterId, setCharacterId] = useState<number | ''>('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Initialize with history item data
  useEffect(() => {
    if (historyItem && open) {
      // Set title from history item text
      setTitle(historyItem.config.text)

      // Set character from history item if not custom image
      if (!historyItem.config.customImage && historyItem.config.character !== undefined) {
        setCharacterId(historyItem.config.character)
      } else {
        setCharacterId('')
      }
    }
  }, [historyItem, open])

  // Auto-fill author from SEKAI Pass user
  useEffect(() => {
    if (user && !author && open) {
      setAuthor(user.username)
    }
  }, [user, author, open])

  const handleSubmit = async () => {
    if (!historyItem || !historyItem.uploadedUrl) {
      setError('只能提交已上传的作品')
      return
    }

    // Title is optional, use text from history item if empty
    const finalTitle = title.trim() || historyItem.config.text.trim() || '无标题贴纸'

    setSubmitting(true)
    setError(null)

    try {
      // 1. Fetch current manifest
      const manifest: GalleryManifest = await fetchGalleryManifest()

      // 2. Create new gallery item
      const newItem: GalleryItem = {
        id: `gallery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: historyItem.uploadedUrl,
        title: finalTitle,
        author: author.trim() || undefined,
        characterId: characterId !== '' ? characterId : undefined,
        tags: tags.length > 0 ? tags : ['其他'],
        uploadDate: new Date().toISOString(),
        description: description.trim() || undefined,
      }

      // 3. Add to manifest
      const updatedManifest: GalleryManifest = {
        ...manifest,
        lastUpdated: new Date().toISOString(),
        items: [newItem, ...manifest.items], // Add to front
      }

      // 4. Upload updated manifest
      await uploadGalleryManifest(updatedManifest)

      setSuccess(true)
      setTimeout(() => {
        onClose()
        // Reset form
        setTitle('')
        setAuthor('')
        setDescription('')
        setTags([])
        setCharacterId('')
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) {
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>✨ 分享作品到画廊</DialogTitle>
      <DialogContent>
        {historyItem && !historyItem.uploadedUrl && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              ⚠️ 此作品尚未上传到服务器，无法提交到画廊
            </Typography>
            <Typography variant="caption" display="block" mt={0.5}>
              请先在主界面点击“上传”按钮，上传成功后再提交
            </Typography>
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            🎉 提交成功！你的作品已添加到画廊，打开画廊即可查看
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {historyItem?.uploadedUrl && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              📝 填写作品信息，让更多人发现你的创作！
            </Typography>
          </Alert>
        )}

        <GallerySubmitFields
          title={title}
          titlePlaceholder={historyItem?.config.text || '留空则使用文本内容'}
          onTitleChange={setTitle}
          author={author}
          onAuthorChange={setAuthor}
          characterId={characterId}
          onCharacterIdChange={setCharacterId}
          tags={tags}
          onTagsChange={setTags}
          description={description}
          onDescriptionChange={setDescription}
          disabled={submitting}
          marginTop={1}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          取消
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || !historyItem?.uploadedUrl}
        >
          {submitting ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              提交中...
            </>
          ) : (
            '提交到画廊'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
