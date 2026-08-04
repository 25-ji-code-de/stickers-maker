// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import charactersData from '../characters.json'

interface GallerySubmitFieldsProps {
  title: string
  titlePlaceholder: string
  onTitleChange: (value: string) => void
  author: string
  onAuthorChange: (value: string) => void
  characterId: number | ''
  onCharacterIdChange: (value: number | '') => void
  tags: string[]
  onTagsChange: (tags: string[]) => void
  description: string
  onDescriptionChange: (value: string) => void
  disabled: boolean
  marginTop?: number
}

export default function GallerySubmitFields({
  title,
  titlePlaceholder,
  onTitleChange,
  author,
  onAuthorChange,
  characterId,
  onCharacterIdChange,
  tags,
  onTagsChange,
  description,
  onDescriptionChange,
  disabled,
  marginTop,
}: GallerySubmitFieldsProps) {
  const [tagInput, setTagInput] = useState('')

  const handleAddTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onTagsChange([...tags, trimmed])
      setTagInput('')
    }
  }

  const handleCharacterChange = (event: SelectChangeEvent<number | ''>) => {
    const value = event.target.value
    onCharacterIdChange(value === '' ? '' : Number(value))
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: marginTop }}>
      <TextField
        label="作品标题（可选）"
        placeholder={titlePlaceholder}
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        fullWidth
        disabled={disabled}
        helperText="留空则自动使用贴纸文本内容"
      />

      <TextField
        label="作者名称"
        placeholder="你的昵称（可留空）"
        value={author}
        onChange={(event) => onAuthorChange(event.target.value)}
        fullWidth
        disabled={disabled}
      />

      <FormControl fullWidth disabled={disabled}>
        <InputLabel>角色</InputLabel>
        <Select value={characterId} label="角色" onChange={handleCharacterChange}>
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
          onChange={(event) => setTagInput(event.target.value)}
          onKeyPress={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              handleAddTag()
            }
          }}
          fullWidth
          disabled={disabled}
          helperText="建议添加 2-5 个标签，帮助他人找到你的作品"
        />
        <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
          {tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onDelete={() => onTagsChange(tags.filter((currentTag) => currentTag !== tag))}
              size="small"
              disabled={disabled}
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
        onChange={(event) => onDescriptionChange(event.target.value)}
        multiline
        rows={3}
        fullWidth
        disabled={disabled}
      />
    </Box>
  )
}
