// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import {
  Box,
  Typography,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
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
} from '@mui/material'
import { Delete, DeleteSweep, Restore, Link as LinkIcon, Search as SearchIcon } from '@mui/icons-material'
import { useState, useMemo } from 'react'
import {
  HistoryItem,
  HistoryFilters,
  HistorySortType,
  UploadStatusFilter,
  TimeRangeFilter,
} from '../../types'
import { filterAndSortHistory } from '../../utils/historyUtils'

interface HistoryPanelProps {
  historyItems: HistoryItem[]
  onLoadHistory: (id: string) => void
  onDeleteHistory: (id: string) => void
  onClearHistory: () => void
}

export default function HistoryPanel({
  historyItems,
  onLoadHistory,
  onDeleteHistory,
  onClearHistory,
}: HistoryPanelProps) {
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null)

  // Filter state
  const [filters, setFilters] = useState<HistoryFilters>({
    searchText: '',
    sortType: 'newest',
    uploadStatus: 'all',
    timeRange: 'all',
  })

  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Apply filters and sorting
  const filteredItems = useMemo(
    () => filterAndSortHistory(historyItems, filters),
    [historyItems, filters]
  )

  // Check if any filters are active
  const hasActiveFilters =
    filters.searchText ||
    filters.sortType !== 'newest' ||
    filters.uploadStatus !== 'all' ||
    filters.timeRange !== 'all'

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp)
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

  const handleItemClick = (item: HistoryItem) => {
    setSelectedItem(item)
  }

  const handleRestore = () => {
    if (selectedItem) {
      onLoadHistory(selectedItem.id)
      setSelectedItem(null)
    }
  }

  const handleDelete = () => {
    if (selectedItem) {
      onDeleteHistory(selectedItem.id)
      setSelectedItem(null)
    }
  }

  const handleClearAll = () => {
    onClearHistory()
    setConfirmClearOpen(false)
  }

  // Filter handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchText: e.target.value }))
  }

  const handleSortChange = (e: SelectChangeEvent<HistorySortType>) => {
    setFilters(prev => ({ ...prev, sortType: e.target.value as HistorySortType }))
  }

  const handleUploadFilterChange = (e: SelectChangeEvent<UploadStatusFilter>) => {
    setFilters(prev => ({ ...prev, uploadStatus: e.target.value as UploadStatusFilter }))
  }

  const handleTimeRangeChange = (e: SelectChangeEvent<TimeRangeFilter>) => {
    setFilters(prev => ({ ...prev, timeRange: e.target.value as TimeRangeFilter }))
  }

  if (historyItems.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body2" color="text.secondary">
          暂无历史记录
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
          生成贴纸后会自动保存到这里
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="h3">
          历史记录
          {hasActiveFilters
            ? ` (显示 ${filteredItems.length} / 总计 ${historyItems.length})`
            : ` (${historyItems.length})`}
        </Typography>
        <Tooltip title="清空全部历史">
          <IconButton
            size="small"
            color="error"
            onClick={() => setConfirmClearOpen(true)}
          >
            <DeleteSweep />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Control Bar */}
      <Box mb={2}>
        <Grid container spacing={1} alignItems="center">
          {/* Search Box */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="搜索文字或角色..."
              value={filters.searchText}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>

          {/* Sort Selector */}
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>排序</InputLabel>
              <Select
                value={filters.sortType}
                label="排序"
                onChange={handleSortChange}
              >
                <MenuItem value="newest">最新优先</MenuItem>
                <MenuItem value="oldest">最旧优先</MenuItem>
                <MenuItem value="uploaded-first">已上传优先</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Upload Status Filter */}
          <Grid item xs={6} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>状态</InputLabel>
              <Select
                value={filters.uploadStatus}
                label="状态"
                onChange={handleUploadFilterChange}
              >
                <MenuItem value="all">全部</MenuItem>
                <MenuItem value="uploaded">已上传</MenuItem>
                <MenuItem value="not-uploaded">未上传</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Time Range Filter */}
          <Grid item xs={12} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>时间</InputLabel>
              <Select
                value={filters.timeRange}
                label="时间"
                onChange={handleTimeRangeChange}
              >
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

      {/* Empty State for Filtered Results */}
      {filteredItems.length === 0 && historyItems.length > 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="body2" color="text.secondary">
            未找到符合条件的历史记录
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            尝试调整筛选条件
          </Typography>
        </Box>
      )}

      {/* Image Grid */}
      {filteredItems.length > 0 && (
        <ImageList cols={isSmallScreen ? 3 : 4} gap={8} sx={{ maxHeight: 400, overflow: 'auto' }}>
          {filteredItems.map((item) => (
          <ImageListItem
            key={item.id}
            sx={{
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 },
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'hidden',
            }}
            onClick={() => handleItemClick(item)}
          >
            <img
              src={item.thumbnail}
              alt={`历史记录 - ${formatTimestamp(item.timestamp)}`}
              loading="lazy"
              style={{
                objectFit: 'contain',
                backgroundColor: '#212121',
                aspectRatio: '296/256',
                width: '100%',
              }}
            />
            <ImageListItemBar
              title={formatTimestamp(item.timestamp)}
              subtitle={item.config.text.substring(0, 10) || '无文字'}
              sx={{
                '& .MuiImageListItemBar-title': { fontSize: '0.7rem' },
                '& .MuiImageListItemBar-subtitle': { fontSize: '0.6rem' },
              }}
            />
            {item.uploadedUrl && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                  borderRadius: 1,
                  p: 0.5,
                }}
              >
                <LinkIcon sx={{ fontSize: 14, color: 'white' }} />
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
        maxWidth="sm"
        fullWidth
      >
        {selectedItem && (
          <>
            <DialogTitle>历史记录详情</DialogTitle>
            <DialogContent>
              <Box textAlign="center" mb={2}>
                <img
                  src={selectedItem.thumbnail}
                  alt="预览"
                  style={{
                    maxWidth: '100%',
                    border: '1px solid #444',
                    borderRadius: 4,
                    backgroundColor: '#212121',
                  }}
                />
              </Box>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                创建时间：{new Date(selectedItem.timestamp).toLocaleString('zh-CN')}
              </Typography>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                文字内容：{selectedItem.config.text || '（无）'}
              </Typography>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                字体大小：{selectedItem.config.fontSize}px
              </Typography>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                位置：X={selectedItem.config.position.x}, Y={selectedItem.config.position.y}
              </Typography>

              {selectedItem.uploadedUrl && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="caption">分享链接：</Typography>
                  <Typography
                    variant="caption"
                    component="div"
                    sx={{
                      wordBreak: 'break-all',
                      mt: 0.5,
                      fontFamily: 'monospace',
                    }}
                  >
                    {selectedItem.uploadedUrl}
                  </Typography>
                </Alert>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                startIcon={<Delete />}
                color="error"
                onClick={handleDelete}
              >
                删除
              </Button>
              <Button onClick={() => setSelectedItem(null)}>取消</Button>
              <Button
                variant="contained"
                startIcon={<Restore />}
                color="secondary"
                onClick={handleRestore}
              >
                恢复此配置
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Clear Confirmation Dialog */}
      <Dialog
        open={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
      >
        <DialogTitle>确认清空历史记录？</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            将删除全部 {historyItems.length} 条历史记录，此操作无法撤销。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClearOpen(false)}>取消</Button>
          <Button color="error" variant="contained" onClick={handleClearAll}>
            清空全部
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
