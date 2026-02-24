// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

/**
 * Utility functions for gallery filtering, sorting, and searching
 */

import {
  GalleryItem,
  GalleryManifest,
  GalleryFilters,
  GallerySortType,
} from '../types'
import { isInTimeRange, getCharacterName } from './historyUtils'

// Re-export for convenience
export { getCharacterName } from './historyUtils'

/**
 * Fetch gallery manifest from storage server
 * @returns Promise resolving to the gallery manifest
 * @throws Error if fetch fails
 */
export async function fetchGalleryManifest(): Promise<GalleryManifest> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

  try {
    const response = await fetch('https://storage.nightcord.de5.net/public/gallery/manifest.json', {
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch gallery: ${response.statusText}`)
    }

    const manifest: GalleryManifest = await response.json()
    return manifest
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Gallery request timed out')
      }
      throw error
    }
    throw new Error('Unknown error fetching gallery')
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Get all unique tags from gallery items
 * @param items - Gallery items
 * @returns Array of unique tags sorted alphabetically
 */
export function getAllTags(items: GalleryItem[]): string[] {
  const tagsSet = new Set<string>()

  items.forEach(item => {
    item.tags.forEach(tag => tagsSet.add(tag))
  })

  return Array.from(tagsSet).sort()
}

/**
 * Check if a gallery item matches the search text
 * Searches in title, author, character name, tags, and description (case-insensitive)
 * @param item - The gallery item
 * @param searchText - The search text
 * @returns True if the item matches
 */
export function matchesGallerySearch(item: GalleryItem, searchText: string): boolean {
  if (!searchText) {
    return true
  }

  const searchLower = searchText.toLowerCase().trim()

  // Search in title
  if (item.title.toLowerCase().includes(searchLower)) {
    return true
  }

  // Search in author
  if (item.author && item.author.toLowerCase().includes(searchLower)) {
    return true
  }

  // Search in character name (if characterId exists)
  if (item.characterId !== undefined) {
    const characterName = getCharacterName(item.characterId).toLowerCase()
    if (characterName.includes(searchLower)) {
      return true
    }
  }

  // Search in tags
  if (item.tags.some(tag => tag.toLowerCase().includes(searchLower))) {
    return true
  }

  // Search in description
  if (item.description && item.description.toLowerCase().includes(searchLower)) {
    return true
  }

  return false
}

/**
 * Check if a gallery item matches the character filter
 * @param item - The gallery item
 * @param filter - Character base name or 'all'
 * @returns True if the item matches
 */
export function matchesCharacterFilter(item: GalleryItem, filter: string | 'all'): boolean {
  if (filter === 'all') {
    return true
  }

  if (item.characterId === undefined) {
    return false
  }

  // Get the character name and remove the number suffix
  const characterName = getCharacterName(item.characterId)
  const baseName = characterName.replace(/\s+\d+$/, '')

  return baseName === filter
}

/**
 * Check if a gallery item matches the tag filter (AND logic)
 * @param item - The gallery item
 * @param selectedTags - Array of selected tags
 * @returns True if the item has all selected tags
 */
export function matchesTagFilter(item: GalleryItem, selectedTags: string[]): boolean {
  if (selectedTags.length === 0) {
    return true
  }

  // Item must have ALL selected tags (AND logic)
  return selectedTags.every(selectedTag => item.tags.includes(selectedTag))
}

/**
 * Sort gallery items according to the sort type
 * @param items - The items to sort
 * @param sortType - The sort type
 * @returns Sorted items (new array)
 */
export function sortGallery(items: GalleryItem[], sortType: GallerySortType): GalleryItem[] {
  const sorted = [...items]

  switch (sortType) {
    case 'newest': {
      // Newest first (descending date)
      return sorted.sort((a, b) => {
        const dateA = new Date(a.uploadDate).getTime()
        const dateB = new Date(b.uploadDate).getTime()
        return dateB - dateA
      })
    }

    case 'oldest': {
      // Oldest first (ascending date)
      return sorted.sort((a, b) => {
        const dateA = new Date(a.uploadDate).getTime()
        const dateB = new Date(b.uploadDate).getTime()
        return dateA - dateB
      })
    }

    case 'featured-first': {
      // Featured items first, then by newest within each group
      return sorted.sort((a, b) => {
        const aFeatured = Boolean(a.featured)
        const bFeatured = Boolean(b.featured)

        // If featured status differs, featured comes first
        if (aFeatured !== bFeatured) {
          return aFeatured ? -1 : 1
        }

        // Within the same group, sort by newest first
        const dateA = new Date(a.uploadDate).getTime()
        const dateB = new Date(b.uploadDate).getTime()
        return dateB - dateA
      })
    }

    default:
      return sorted
  }
}

/**
 * Main function to filter and sort gallery items
 * @param items - The gallery items to process
 * @param filters - The filter criteria
 * @returns Filtered and sorted gallery items
 */
export function filterAndSortGallery(items: GalleryItem[], filters: GalleryFilters): GalleryItem[] {
  // Apply filters
  let filtered = items.filter(item => {
    // Check search text
    if (!matchesGallerySearch(item, filters.searchText)) {
      return false
    }

    // Check character filter
    if (!matchesCharacterFilter(item, filters.character)) {
      return false
    }

    // Check tag filter
    if (!matchesTagFilter(item, filters.selectedTags)) {
      return false
    }

    // Check time range
    const itemTimestamp = new Date(item.uploadDate).getTime()
    if (!isInTimeRange(itemTimestamp, filters.timeRange)) {
      return false
    }

    return true
  })

  // Apply sorting
  filtered = sortGallery(filtered, filters.sortType)

  return filtered
}
