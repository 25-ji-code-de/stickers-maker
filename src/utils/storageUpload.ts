// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

export interface StorageUploadResult {
  uuid: string
  key: string
  type: string
  size: number
  sizeBytes: number
  name: string
  kind: 'image' | 'file' | 'sticker'
  path: string
  url: string
}

interface UploadOptions {
  baseUrl?: string
  publicBaseUrl?: string
  kind?: 'image' | 'file' | 'sticker'
  contentType?: string
  onProgress?: (percent: number) => void
}

const DEFAULT_STORAGE_BASE_URL = 'https://storage.nightcord.de5.net'
const DEFAULT_PUBLIC_BASE_URL = 'https://r2.nightcord.de5.net'

export async function uploadStorageV2Direct(
  file: Blob,
  filename: string,
  options: UploadOptions = {},
): Promise<StorageUploadResult> {
  const baseUrl = (options.baseUrl || DEFAULT_STORAGE_BASE_URL).replace(/\/$/, '')
  const kind = options.kind || inferKind(file.type)
  const contentType = options.contentType || file.type || 'application/octet-stream'

  const init = await jsonPost(`${baseUrl}/v2/upload/init`, {
    name: filename,
    type: contentType,
    size: file.size,
    kind,
  })
  const upload = isRecord(init.upload) ? init.upload : {}
  const fields = isRecord(upload.fields) ? upload.fields : {}
  const uploadUrl = typeof upload.url === 'string' ? upload.url : undefined
  const uploadMethod = typeof upload.method === 'string' ? upload.method : 'POST'
  const completeToken = typeof init.complete_token === 'string' ? init.complete_token : ''

  const form = new FormData()
  for (const [name, value] of Object.entries(fields)) {
    form.append(name, String(value))
  }
  form.append('file', file, filename)

  await xhrUpload(uploadMethod, uploadUrl, form, options.onProgress)

  const completed = await jsonPost(`${baseUrl}/v2/upload/complete`, {
    token: completeToken,
  })
  options.onProgress?.(100)
  return normalizeStorageResult(completed, {
    publicBaseUrl: options.publicBaseUrl || DEFAULT_PUBLIC_BASE_URL,
    kind,
  })
}

async function jsonPost(url: string, body: unknown): Promise<Record<string, unknown>> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    let message = `Upload failed: ${response.status}`
    try {
      const data = await response.json()
      if (typeof data === 'object' && data && 'error' in data) {
        message = String(data.error)
      }
    } catch {
      // ignore
    }
    const error = new Error(message)
    ;(error as Error & { status?: number }).status = response.status
    throw error
  }
  return response.json()
}

function xhrUpload(
  method: string,
  url: string | undefined,
  body: XMLHttpRequestBodyInit,
  onProgress?: (percent: number) => void,
  headers: Record<string, string> = {},
): Promise<XMLHttpRequest> {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('Upload URL missing'))
      return
    }

    const xhr = new XMLHttpRequest()
    xhr.upload.addEventListener('progress', (event) => {
      if (!event.lengthComputable || !onProgress) return
      onProgress(Math.min(99, Math.round((event.loaded / event.total) * 99)))
    })
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr)
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`))
      }
    })
    xhr.addEventListener('error', () => reject(new Error('Network error')))
    xhr.addEventListener('abort', () => reject(new Error('Upload aborted')))
    xhr.timeout = 30000
    xhr.addEventListener('timeout', () => reject(new Error('Upload timeout')))
    xhr.open(method, url)
    for (const [name, value] of Object.entries(headers)) {
      xhr.setRequestHeader(name, value)
    }
    xhr.send(body)
  })
}

function normalizeStorageResult(
  raw: Record<string, unknown>,
  options: { publicBaseUrl: string; kind: 'image' | 'file' | 'sticker' },
): StorageUploadResult {
  const uuid = String(raw.uuid || raw.key || '')
  if (!uuid) throw new Error('Upload response missing resource id')

  const rawKind = raw.kind
  const kind = rawKind === 'image' || rawKind === 'sticker' ? rawKind : options.kind
  const path = typeof raw.url === 'string' && raw.url.startsWith('/')
    ? raw.url
    : storagePathFor(uuid, kind)
  const publicBaseUrl = options.publicBaseUrl.replace(/\/$/, '')
  const sizeBytes = typeof raw.size_bytes === 'number' ? raw.size_bytes : Number(raw.size) || 0

  return {
    uuid,
    key: uuid,
    type: String(raw.type || ''),
    size: Number(raw.size) || 0,
    sizeBytes,
    name: String(raw.name || ''),
    kind,
    path,
    url: `${publicBaseUrl}${path}`,
  }
}

function inferKind(mime: string): 'image' | 'file' {
  return mime.startsWith('image/') ? 'image' : 'file'
}

function storagePathFor(uuid: string, kind: 'image' | 'file' | 'sticker'): string {
  if (kind === 'image') return `/images/${uuid}`
  if (kind === 'sticker') return `/stickers/${uuid}`
  return `/files/${uuid}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
