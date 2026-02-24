// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import {
  Box,
  Typography,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  useMediaQuery,
  useTheme,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  SelectChangeEvent,
  CircularProgress,
  LinearProgress,
  Chip,
} from '@mui/material'
import {
  ImageSearch as ImageSearchIcon,
  Search as SearchIcon,
  OpenInNew,
  ContentCopy,
  Star,
  Refresh,
} from '@mui/icons-material'
import { useState, useMemo, useEffect } from 'react'
import {
  GalleryItem,
  GalleryFilters,
  GallerySortType,
  TimeRangeFilter,
} from '../../types'
import {
  fetchGalleryManifest,
  filterAndSortGallery,
  getAllTags,
  getCharacterName,
} from '../../utils/galleryUtils'
import charactersData from '../../characters.json'

export default function GalleryPanel() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)

  // Filter state
  const [filters, setFilters] = useState<GalleryFilters>({
    searchText: '',
    sortType: 'newest',
    character: 'all',
    timeRange: 'all',
    selectedTags: [],
  })

  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Load gallery manifest
  useEffect(() => {
    loadGallery()
  }, [])

  const loadGallery = async () => {
    setLoading(true)
    setError(null)

    try {
      const manifest = await fetchGalleryManifest()
      setGalleryItems(manifest.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gallery')
    } finally {
      setLoading(false)
    }
  }

  // Apply filters and sorting
  const filteredItems = useMemo(
    () => filterAndSortGallery(galleryItems, filters),
    [galleryItems, filters]
  )

  // Get all unique tags
  const allTags = useMemo(() => getAllTags(galleryItems), [galleryItems])

  // Get unique character names (without numbers)
  const uniqueCharacters = useMemo(() => {
    const characterNames = new Set<string>()
    charactersData.forEach(char => {
      // Remove trailing numbers like " 01", " 02" etc
      const baseName = char.name.replace(/\s+\d+$/, '')
      characterNames.add(baseName)
    })
    return Array.from(characterNames).sort()
  }, [])

  // Check if any filters are active
  const hasActiveFilters =
    filters.searchText ||
    filters.sortType !== 'newest' ||
    filters.character !== 'all' ||
    filters.timeRange !== 'all' ||
    filters.selectedTags.length > 0

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 7) return `${diffDays}天前`
    return date.toLocaleDateString('zh-CN')
  }

  const handleItemClick = (item: GalleryItem) => {
    setSelectedItem(item)
  }

  const handleCopyLink = async () => {
    if (selectedItem) {
      try {
        await navigator.clipboard.writeText(selectedItem.url)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  const handleOpenInNew = () => {
    if (selectedItem) {
      window.open(selectedItem.url, '_blank', 'noopener,noreferrer')
    }
  }

  // Filter handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchText: e.target.value }))
  }

  const handleSortChange = (e: SelectChangeEvent<GallerySortType>) => {
    setFilters(prev => ({ ...prev, sortType: e.target.value as GallerySortType }))
  }

  const handleCharacterChange = (e: SelectChangeEvent<string | 'all'>) => {
    const value = e.target.value
    setFilters(prev => ({ ...prev, character: value as string | 'all' }))
  }

  const handleTimeRangeChange = (e: SelectChangeEvent<TimeRangeFilter>) => {
    setFilters(prev => ({ ...prev, timeRange: e.target.value as TimeRangeFilter }))
  }

  const handleTagToggle = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag],
    }))
  }

  // Loading state
  if (loading) {
    return (
      <Box>
        <LinearProgress sx={{ mb: 2 }} />
        <Box textAlign="center" py={4}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" mt={2}>
            正在加载画廊...
          </Typography>
        </Box>
      </Box>
    )
  }

  // Error state
  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Box textAlign="center" py={2}>
          <Button variant="contained" onClick={loadGallery}>
            重试
          </Button>
        </Box>
      </Box>
    )
  }

  // Empty gallery
  if (galleryItems.length === 0) {
    return (
      <Box>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            <strong>📸 如何分享你的作品到画廊：</strong>
          </Typography>
          <Typography variant="body2" component="div">
            1️⃣ 创建你的贴纸并调整样式<br/>
            2️⃣ 点击"上传"按钮，将作品上传到服务器<br/>
            3️⃣ 打开"历史记录"，找到已上传的作品<br/>
            4️⃣ 点击作品查看详情，点击"提交到画廊"按钮<br/>
            5️⃣ 填写标题和标签，提交即可分享给大家！
          </Typography>
        </Alert>
        <Box textAlign="center" py={4}>
          <ImageSearchIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            画廊暂无作品
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            成为第一个分享作品的人吧！
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<Refresh />}
            onClick={loadGallery}
            sx={{ mt: 2 }}
          >
            刷新画廊
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header with info */}
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          💡 <strong>如何分享作品：</strong>
          创建贴纸 → 上传到服务器 → 打开历史记录 → 点击已上传作品 → 点击"提交到画廊"按钮
        </Typography>
      </Alert>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="h3">
          探索画廊
          {hasActiveFilters
            ? ` (显示 ${filteredItems.length} / 总计 ${galleryItems.length})`
            : ` (${galleryItems.length})`}
        </Typography>
        <Button
          size="small"
          startIcon={<Refresh />}
          onClick={loadGallery}
          disabled={loading}
        >
          刷新
        </Button>
      </Box>

      {/* Filter Bar */}
      <Box mb={2}>
        <Grid container spacing={1} alignItems="center">
          {/* Search Box */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="搜索标题、作者、角色、标签..."
              value={filters.searchText}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>

          {/* Sort Selector */}
          <Grid item xs={6} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>排序</InputLabel>
              <Select value={filters.sortType} label="排序" onChange={handleSortChange}>
                <MenuItem value="newest">最新优先</MenuItem>
                <MenuItem value="oldest">最旧优先</MenuItem>
                <MenuItem value="featured-first">精选优先</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Character Filter */}
          <Grid item xs={6} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>角色</InputLabel>
              <Select value={filters.character} label="角色" onChange={handleCharacterChange}>
                <MenuItem value="all">全部角色</MenuItem>
                {uniqueCharacters.map((charName) => (
                  <MenuItem key={charName} value={charName}>
                    {charName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Time Range Filter */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>时间</InputLabel>
              <Select value={filters.timeRange} label="时间" onChange={handleTimeRangeChange}>
                <MenuItem value="all">全部</MenuItem>
                <MenuItem value="today">今天</MenuItem>
                <MenuItem value="week">本周</MenuItem>
                <MenuItem value="month">本月</MenuItem>
                <MenuItem value="earlier">更早</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Tag Filter Chips */}
      {allTags.length > 0 && (
        <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
          {allTags.map(tag => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              onClick={() => handleTagToggle(tag)}
              color={filters.selectedTags.includes(tag) ? 'primary' : 'default'}
              variant={filters.selectedTags.includes(tag) ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      )}

      {/* Empty State for Filtered Results */}
      {filteredItems.length === 0 && galleryItems.length > 0 && (
        <Box textAlign="center" py={4}>
          <ImageSearchIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            未找到符合条件的作品
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            尝试调整筛选条件
          </Typography>
        </Box>
      )}

      {/* Image Grid */}
      {filteredItems.length > 0 && (
        <ImageList
          cols={isSmallScreen ? 2 : isMobile ? 3 : 4}
          gap={12}
          sx={{ maxHeight: 500, overflow: 'auto' }}
        >
          {filteredItems.map(item => (
            <ImageListItem
              key={item.id}
              sx={{
                cursor: 'pointer',
                '&:hover': { opacity: 0.8 },
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'hidden',
                position: 'relative',
              }}
              onClick={() => handleItemClick(item)}
            >
              <img
                src={item.url}
                alt={item.title}
                loading="lazy"
                style={{
                  objectFit: 'contain',
                  backgroundColor: '#212121',
                  aspectRatio: '296/256',
                  width: '100%',
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.nextElementSibling?.remove()
                  const errorDiv = document.createElement('div')
                  errorDiv.style.cssText = 'display:flex;align-items:center;justify-content:center;height:100%;background:#212121;color:#888;'
                  errorDiv.textContent = '图片加载失败'
                  target.parentElement?.appendChild(errorDiv)
                }}
              />
              <ImageListItemBar
                title={item.title}
                subtitle={`${item.author || '匿名'} · ${formatDate(item.uploadDate)}`}
                sx={{
                  '& .MuiImageListItemBar-title': { fontSize: '0.8rem' },
                  '& .MuiImageListItemBar-subtitle': { fontSize: '0.7rem' },
                }}
              />
              {item.featured && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    bgcolor: 'rgba(255, 193, 7, 0.9)',
                    borderRadius: 1,
                    p: 0.5,
                  }}
                >
                  <Star sx={{ fontSize: 16, color: 'white' }} />
                </Box>
              )}
            </ImageListItem>
          ))}
        </ImageList>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        {selectedItem && (
          <>
            <DialogTitle>
              {selectedItem.title}
              {selectedItem.featured && (
                <Chip
                  icon={<Star />}
                  label="精选"
                  size="small"
                  color="warning"
                  sx={{ ml: 1 }}
                />
              )}
            </DialogTitle>
            <DialogContent>
              <Box textAlign="center" mb={2}>
                <img
                  src={selectedItem.url}
                  alt={selectedItem.title}
                  style={{
                    maxWidth: '100%',
                    border: '1px solid #444',
                    borderRadius: 4,
                    backgroundColor: '#212121',
                  }}
                />
              </Box>

              {selectedItem.author && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  作者：{selectedItem.author}
                </Typography>
              )}

              {selectedItem.characterId !== undefined && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  角色：{getCharacterName(selectedItem.characterId)}
                </Typography>
              )}

              <Typography variant="body2" color="text.secondary" gutterBottom>
                上传日期：{new Date(selectedItem.uploadDate).toLocaleString('zh-CN')}
              </Typography>

              {selectedItem.tags.length > 0 && (
                <Box display="flex" gap={1} flexWrap="wrap" mt={1} mb={1}>
                  {selectedItem.tags.map(tag => (
                    <Chip key={tag} label={tag} size="small" />
                  ))}
                </Box>
              )}

              {selectedItem.description && (
                <Typography variant="body2" mt={2}>
                  {selectedItem.description}
                </Typography>
              )}

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="caption">作品链接：</Typography>
                <Typography
                  variant="caption"
                  component="div"
                  sx={{
                    wordBreak: 'break-all',
                    mt: 0.5,
                    fontFamily: 'monospace',
                  }}
                >
                  {selectedItem.url}
                </Typography>
              </Alert>
            </DialogContent>
            <DialogActions>
              <Button startIcon={<ContentCopy />} onClick={handleCopyLink}>
                复制链接
              </Button>
              <Button startIcon={<OpenInNew />} onClick={handleOpenInNew}>
                新标签打开
              </Button>
              <Button onClick={() => setSelectedItem(null)}>关闭</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}
