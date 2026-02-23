// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import {
  ImageList,
  ImageListItem,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Tooltip,
  Popover,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useState, useMemo, useCallback } from 'react'
import characters from '../characters.json'
import { PersonSearch } from '@mui/icons-material'

interface PickerProps {
  setCharacter: (index: number) => void
  color: string
}

const pickerItemSx = {
  cursor: 'pointer',
  '&:hover': {
    opacity: 0.5,
  },
  '&:active': {
    opacity: 0.8,
  },
}

export default function Picker({ setCharacter, color }: PickerProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [search, setSearch] = useState('')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const open = Boolean(anchorEl)

  const handleOpen = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }, [])

  const handleClose = useCallback(() => {
    setAnchorEl(null)
    setSearch('') // 关闭时清空搜索
  }, [])

  const handleCharacterSelect = useCallback((index: number) => {
    handleClose()
    setCharacter(index)
  }, [handleClose, setCharacter])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }, [])

  const renderedItems = useMemo(() => {
    const s = search.toLowerCase()
    return characters.reduce((acc: JSX.Element[], c, index) => {
      if (
        s === '' ||
        s === c.id ||
        c.name.toLowerCase().includes(s) ||
        c.character.toLowerCase().includes(s)
      ) {
        acc.push(
          <ImageListItem
            key={index}
            onClick={() => handleCharacterSelect(index)}
            sx={pickerItemSx}
          >
            <img
              src={`/img/${c.img}`}
              srcSet={`/img/${c.img}`}
              alt={c.name}
              loading="lazy"
              style={{ borderRadius: '4px' }}
            />
          </ImageListItem>
        )
      }
      return acc
    }, [])
  }, [search, handleCharacterSelect])

  // 统一使用 IconButton 触发器
  const triggerButton = (
    <Tooltip title="选择角色">
      <IconButton
        color="secondary"
        onClick={handleOpen}
        sx={{ color: color }}
        size="small"
      >
        <PersonSearch />
      </IconButton>
    </Tooltip>
  )

  // 移动端：使用 Dialog（全屏模态框）
  if (isMobile) {
    return (
      <>
        {triggerButton}
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>选择角色</DialogTitle>
          <DialogContent>
            <TextField
              label="搜索角色"
              size="small"
              color="secondary"
              value={search}
              fullWidth
              onChange={handleSearchChange}
              sx={{ mb: 2 }}
            />
            <ImageList
              sx={{
                width: '100%',
                maxHeight: 450,
              }}
              cols={3}
              rowHeight={140}
            >
              {renderedItems}
            </ImageList>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // 桌面端：使用 Popover（从按钮下方弹出）
  return (
    <>
      {triggerButton}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              overflow: 'hidden',
              maxWidth: 560,
            }
          }
        }}
      >
        <Box sx={{ p: 1.5 }}>
          <TextField
            label="搜索角色"
            size="small"
            color="secondary"
            value={search}
            fullWidth
            onChange={handleSearchChange}
            sx={{ mb: 1.5 }}
            autoFocus
          />
          <Box
            sx={{
              maxHeight: 450,
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'rgba(228, 194, 200, 0.5)',
                borderRadius: '4px',
              },
            }}
          >
            <ImageList
              cols={4}
              rowHeight={120}
              gap={8}
            >
              {renderedItems}
            </ImageList>
          </Box>
        </Box>
      </Popover>
    </>
  )
}
