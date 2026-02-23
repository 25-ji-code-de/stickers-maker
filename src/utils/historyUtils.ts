// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

/**
 * Utility functions for history filtering, sorting, and searching
 */

import {
  HistoryItem,
  HistoryFilters,
  HistorySortType,
  TimeRangeFilter,
  UploadStatusFilter,
} from '../types'
import charactersData from '../characters.json'

/**
 * Get character name by ID from characters.json
 * @param characterId - The character ID (index in the config)
 * @returns Character name or "未知角色" if not found
 */
export function getCharacterName(characterId: number): string {
  if (characterId < 0 || characterId >= charactersData.length) {
    return '未知角色'
  }
  return charactersData[characterId].name
}

/**
 * Get display name for a history item's character
 * Returns "自定义图片" for custom images
 * @param item - The history item
 * @returns Display name for the character
 */
export function getCharacterDisplayName(item: HistoryItem): string {
  if (item.config.customImage) {
    return '自定义图片'
  }
  return getCharacterName(item.config.character)
}

/**
 * Get timestamp boundary for a time range filter
 * @param range - The time range filter
 * @returns Timestamp (milliseconds since epoch) representing the boundary
 */
export function getTimeRangeBoundary(range: TimeRangeFilter): number {
  const now = new Date()

  switch (range) {
    case 'today': {
      // Start of today
      const startOfToday = new Date(now)
      startOfToday.setHours(0, 0, 0, 0)
      return startOfToday.getTime()
    }
    case 'week': {
      // 7 days ago
      const weekAgo = new Date(now)
      weekAgo.setDate(weekAgo.getDate() - 7)
      return weekAgo.getTime()
    }
    case 'month': {
      // 1 month ago
      const monthAgo = new Date(now)
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return monthAgo.getTime()
    }
    case 'earlier': {
      // 2 months ago (for excluding recent records)
      const twoMonthsAgo = new Date(now)
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)
      return twoMonthsAgo.getTime()
    }
    default:
      return 0
  }
}

/**
 * Check if a timestamp is within a time range
 * @param timestamp - The timestamp to check
 * @param range - The time range filter
 * @returns True if the timestamp is within the range
 */
export function isInTimeRange(timestamp: number, range: TimeRangeFilter): boolean {
  if (range === 'all') {
    return true
  }

  const boundary = getTimeRangeBoundary(range)

  if (range === 'earlier') {
    // For "earlier", we want items OLDER than the boundary
    return timestamp < boundary
  } else {
    // For other ranges, we want items NEWER than the boundary
    return timestamp >= boundary
  }
}

/**
 * Check if a history item matches the search text
 * Searches in both text content and character name (case-insensitive)
 * @param item - The history item
 * @param searchText - The search text
 * @returns True if the item matches
 */
export function matchesSearch(item: HistoryItem, searchText: string): boolean {
  if (!searchText) {
    return true
  }

  const searchLower = searchText.toLowerCase().trim()

  // Search in text content
  const textContent = item.config.text.toLowerCase()
  if (textContent.includes(searchLower)) {
    return true
  }

  // Skip character search for custom images
  if (item.config.customImage) {
    return false
  }

  // Search in character name
  const characterName = getCharacterName(item.config.character).toLowerCase()
  return characterName.includes(searchLower)
}

/**
 * Filter history items by upload status
 * @param item - The history item
 * @param status - The upload status filter
 * @returns True if the item matches the filter
 */
function matchesUploadStatus(item: HistoryItem, status: UploadStatusFilter): boolean {
  if (status === 'all') {
    return true
  }

  const hasUploadedUrl = Boolean(item.uploadedUrl)
  return status === 'uploaded' ? hasUploadedUrl : !hasUploadedUrl
}

/**
 * Sort history items according to the sort type
 * @param items - The items to sort
 * @param sortType - The sort type
 * @returns Sorted items (new array)
 */
function sortHistory(items: HistoryItem[], sortType: HistorySortType): HistoryItem[] {
  const sorted = [...items]

  switch (sortType) {
    case 'newest':
      // Newest first (descending timestamp)
      return sorted.sort((a, b) => b.timestamp - a.timestamp)

    case 'oldest':
      // Oldest first (ascending timestamp)
      return sorted.sort((a, b) => a.timestamp - b.timestamp)

    case 'uploaded-first': {
      // Uploaded items first, then by newest within each group
      return sorted.sort((a, b) => {
        const aUploaded = Boolean(a.uploadedUrl)
        const bUploaded = Boolean(b.uploadedUrl)

        // If upload status differs, uploaded comes first
        if (aUploaded !== bUploaded) {
          return aUploaded ? -1 : 1
        }

        // Within the same group, sort by newest first
        return b.timestamp - a.timestamp
      })
    }

    default:
      return sorted
  }
}

/**
 * Main function to filter and sort history items
 * @param items - The history items to process
 * @param filters - The filter criteria
 * @returns Filtered and sorted history items
 */
export function filterAndSortHistory(
  items: HistoryItem[],
  filters: HistoryFilters
): HistoryItem[] {
  // Apply filters
  let filtered = items.filter(item => {
    // Check search text
    if (!matchesSearch(item, filters.searchText)) {
      return false
    }

    // Check upload status
    if (!matchesUploadStatus(item, filters.uploadStatus)) {
      return false
    }

    // Check time range
    if (!isInTimeRange(item.timestamp, filters.timeRange)) {
      return false
    }

    return true
  })

  // Apply sorting
  filtered = sortHistory(filtered, filters.sortType)

  return filtered
}
