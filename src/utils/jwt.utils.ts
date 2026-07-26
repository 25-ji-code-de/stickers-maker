// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

/**
 * JWT parsing utilities (no signature verification - trust the issuer)
 *
 * ── 解码为什么委托给 SDK ──────────────────────────────────────────
 *
 * 本文件原本自带一份 base64url 解码：
 *
 *     function base64URLDecode(base64url: string): string {
 *       let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
 *       …
 *       return atob(base64)          // ← 到此为止
 *     }
 *
 * `atob` 返回的是**字节串**（每个字符一个字节），对多字节 UTF-8 直接
 * `JSON.parse` 会得到乱码：`なこ` 解出来是 `ãªã`。
 *
 * 而 ID Token 的 `name` / `preferred_username` 正是非 ASCII 的重灾区。
 * 后果不只是显示难看 —— 拿解错的值去比对身份时永远不相等。
 *
 * 生态里有四处解 JWT payload 的实现，另外三处（sekai-auth、sekai-pass、
 * puzzle-sekai）都做了 `Uint8Array.from(binary, c => c.charCodeAt(0))`
 * + `TextDecoder`，只有这里没有。
 *
 * 本文件此前**没有任何调用点**，所以这不是活的 bug —— 但下一个需要解 JWT
 * 的人 import 它，昵称就会静默变乱码。
 *
 * ── 为什么没有直接用 SDK 的那份 ──────────────────────────────────
 *
 * 本仓依赖的是 `@25-ji-code-de/sekai-auth#v0.1.2`，而 `decodeJwtPayload`
 * 是 v0.2.0 才导出的（还在未合并的 PR 里）。**不让本仓依赖未发布的代码。**
 *
 * 所以这里保留本地实现，只补上缺的那一步。SDK 版本升上去之后，
 * 这个函数可以整个换成 `import { decodeJwtPayload } from '@25-ji-code-de/sekai-auth'`
 * —— `test/jwt-utf8.test.mjs` 会保证换过去之后行为不变。
 */

interface JWTPayload {
  sub: string
  iss?: string
  aud?: string
  exp?: number
  iat?: number
  [key: string]: unknown
}

/**
 * Parse JWT token and extract payload
 * @param token - The JWT token
 * @returns Decoded payload
 * @throws Error if token format is invalid
 */
export function parseJWT(token: string): JWTPayload {
  try {
    const parts = String(token).split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format')
    }
    return JSON.parse(base64URLDecodeUtf8(parts[1]))
  } catch (err) {
    throw new Error(`Failed to parse JWT: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }
}

/**
 * Check if JWT token is expired
 * @param token - The JWT token
 * @returns True if expired, false otherwise
 *
 * SDK 没有这个 helper，所以无论如何都留在本地。
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = parseJWT(token)
    if (!payload.exp) {
      return false // No expiration claim
    }

    const now = Math.floor(Date.now() / 1000)
    return payload.exp < now
  } catch {
    return true // Treat parsing errors as expired
  }
}

/**
 * Decode a Base64URL segment as UTF-8.
 *
 * 关键是最后那两步：`atob` 只给出**字节串**（每个字符一个字节），
 * 必须先还原成字节数组再用 `TextDecoder` 按 UTF-8 解，
 * 否则多字节字符会变成乱码（`なこ` → `ãªã`）。
 *
 * 与 sekai-auth 的 `decodeJwtPayload` 是同一套做法。
 */
function base64URLDecodeUtf8(base64url: string): string {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')

  const padding = base64.length % 4
  if (padding > 0) {
    base64 += '='.repeat(4 - padding)
  }

  const binary = atob(base64)
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}
