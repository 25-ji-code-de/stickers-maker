// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import {
  Box,
  Button,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material'
import { useState, useEffect } from 'react'
import { GalleryItem, GalleryManifest } from '../types'
import { useAuth } from '../hooks/useAuth'
import { fetchGalleryManifest, uploadGalleryManifest } from '../utils/galleryUtils'
import GallerySubmitFields from './GallerySubmitFields'

interface GallerySubmitFormProps {
  uploadedUrl: string
  defaultTitle?: string
  defaultCharacterId?: number
  onSuccess?: () => void
}

export default function GallerySubmitForm({
  uploadedUrl,
  defaultTitle = '',
  defaultCharacterId,
  onSuccess,
}: GallerySubmitFormProps) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [characterId, setCharacterId] = useState<number | ''>('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Initialize with defaults
  useEffect(() => {
    setTitle(defaultTitle)
    if (defaultCharacterId !== undefined) {
      setCharacterId(defaultCharacterId)
    }
  }, [defaultTitle, defaultCharacterId])

  // Auto-fill author from SEKAI Pass user
  useEffect(() => {
    if (user && !author) {
      setAuthor(user.username)
    }
  }, [user, author])

  const handleSubmit = async () => {
    if (!uploadedUrl) {
      setError('没有上传链接')
      return
    }

    // Title is optional, use default if empty
    const finalTitle = title.trim() || defaultTitle.trim() || '无标题贴纸'

    setSubmitting(true)
    setError(null)

    try {
      // 1. Fetch current manifest
      const manifest: GalleryManifest = await fetchGalleryManifest()

      // 2. Create new gallery item
      const newItem: GalleryItem = {
        id: `gallery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: uploadedUrl,
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
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <Alert severity="success">
        <Typography variant="body2" gutterBottom>
          🎉 提交成功！你的作品已添加到画廊
        </Typography>
        <Typography variant="caption" display="block">
          打开画廊刷新即可查看
        </Typography>
      </Alert>
    )
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          📝 填写作品信息，让更多人发现你的创作！
        </Typography>
      </Alert>

      <GallerySubmitFields
        title={title}
        titlePlaceholder={defaultTitle || '留空则使用文本内容'}
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
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          fullWidth
          size="large"
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
      </Box>
    </Box>
  )
}
