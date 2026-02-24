// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import {
  Box,
  TextField,
  Button,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Typography,
} from '@mui/material'
import { useState, useEffect } from 'react'
import { GalleryItem, GalleryManifest } from '../types'
import charactersData from '../characters.json'

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
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
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

  const handleAddTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove))
  }

  const handleCharacterChange = (e: SelectChangeEvent<number | ''>) => {
    const value = e.target.value
    setCharacterId(value === '' ? '' : Number(value))
  }

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
      const response = await fetch('https://storage.nightcord.de5.net/public/gallery/manifest.json')
      if (!response.ok) {
        throw new Error('Failed to fetch gallery')
      }
      const manifest: GalleryManifest = await response.json()

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
      const uploadResponse = await fetch('https://storage.nightcord.de5.net/', {
        method: 'PUT',
        headers: {
          'X-Safe-Path': 'public/gallery',
          'X-Filename': 'manifest.json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedManifest, null, 2),
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload to gallery')
      }

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

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="作品标题（可选）"
          placeholder={defaultTitle || "留空则使用文本内容"}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          disabled={submitting}
          helperText="留空则自动使用贴纸文本内容"
        />

        <TextField
          label="作者名称"
          placeholder="你的昵称（可留空）"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          fullWidth
          disabled={submitting}
        />

        <FormControl fullWidth disabled={submitting}>
          <InputLabel>角色</InputLabel>
          <Select
            value={characterId}
            label="角色"
            onChange={handleCharacterChange}
          >
            <MenuItem value="">不指定角色</MenuItem>
            {charactersData.map((char, idx) => (
              <MenuItem key={idx} value={idx}>
                {char.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box>
          <TextField
            label="标签"
            placeholder="输入标签后按回车添加"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddTag()
              }
            }}
            fullWidth
            disabled={submitting}
            helperText="建议添加 2-5 个标签，帮助他人找到你的作品"
          />
          <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleRemoveTag(tag)}
                size="small"
                disabled={submitting}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
            💡 例如：可爱、表情、搞笑、节日、创意等
          </Typography>
        </Box>

        <TextField
          label="作品描述"
          placeholder="简单介绍一下这个作品的灵感或用途"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={3}
          fullWidth
          disabled={submitting}
        />

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
