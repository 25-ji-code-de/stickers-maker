// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import { ShortcutCategory } from '../types'

/**
 * Get platform-specific display key
 */
export function getDisplayKey(key: string): string {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  if (key === 'Ctrl') return isMac ? 'Cmd' : 'Ctrl'
  if (key === '←') return '←'
  if (key === '→') return '→'
  if (key === '↑') return '↑'
  if (key === '↓') return '↓'
  return key
}

/**
 * Complete keyboard shortcuts configuration
 */
export const SHORTCUTS_CONFIG: ShortcutCategory[] = [
  {
    name: '导出与复制',
    shortcuts: [
      { keys: ['Ctrl', 'C'], description: '复制 PNG（透明背景）' },
      { keys: ['Ctrl', 'S'], description: '保存 PNG 文件' },
      { keys: ['Ctrl', 'Shift', 'C'], description: '复制 JPG（白色背景）' },
      { keys: ['Ctrl', 'Shift', 'S'], description: '保存 JPG 文件' },
      { keys: ['Ctrl', 'Shift', 'E'], description: '保存 WEBP 文件' },
    ],
  },
  {
    name: '系统操作',
    shortcuts: [
      { keys: ['Ctrl', 'Z'], description: '撤销' },
      { keys: ['Ctrl', 'Y'], description: '重做' },
      { keys: ['Ctrl', 'Shift', 'Z'], description: '重做（备选）' },
      { keys: ['Ctrl', 'H'], description: '打开历史记录' },
      { keys: ['Ctrl', 'G'], description: '打开探索画廊' },
      { keys: ['Ctrl', 'R'], description: '重置所有设置' },
      { keys: ['Ctrl', 'I'], description: '打开关于页面' },
      { keys: ['?'], description: '打开快捷键帮助' },
      { keys: ['F1'], description: '打开快捷键帮助' },
      { keys: ['Esc'], description: '关闭当前对话框' },
    ],
  },
  {
    name: '位置调整',
    shortcuts: [
      { keys: ['←'], description: '左移（5px）' },
      { keys: ['→'], description: '右移（5px）' },
      { keys: ['↑'], description: '上移（5px）' },
      { keys: ['↓'], description: '下移（5px）' },
      { keys: ['Shift', '←'], description: '左移（精细 1px）' },
      { keys: ['Shift', '→'], description: '右移（精细 1px）' },
      { keys: ['Shift', '↑'], description: '上移（精细 1px）' },
      { keys: ['Shift', '↓'], description: '下移（精细 1px）' },
    ],
  },
  {
    name: '样式调整',
    shortcuts: [
      { keys: ['+/='], description: '增大字号（+2px）' },
      { keys: ['-'], description: '减小字号（-2px）' },
      { keys: ['['], description: '减小字间距（-1）' },
      { keys: [']'], description: '增大字间距（+1）' },
      { keys: ['Shift', '['], description: '减小行间距（-2）' },
      { keys: ['Shift', ']'], description: '增大行间距（+2）' },
      { keys: [','], description: '逆时针旋转（-0.5°）' },
      { keys: ['.'], description: '顺时针旋转（+0.5°）' },
    ],
  },
  {
    name: '开关切换',
    shortcuts: [
      { keys: ['C'], description: '切换弧形文字' },
      { keys: ['V'], description: '切换竖排文字' },
      { keys: ['B'], description: '切换文字置于底层' },
    ],
  },
]
