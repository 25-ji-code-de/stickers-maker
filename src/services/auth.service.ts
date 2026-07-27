// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

/**
 * OAuth 2.1 + OIDC 认证服务 —— 实现已移至 @25-ji-code-de/sekai-auth（Apache-2.0）。
 *
 * 这个文件此前是生态内四份独立 OAuth 实现之一（另外三份在 hub、25ji-sagyo、
 * nightcord）。现在只做三件事：
 *   1. 把 Vite 的 import.meta.env 映射成 SDK 的构造参数
 *   2. 把 SDK 的离散 storage key 与本仓历史上的单块 JSON blob 做一次性迁移
 *   3. 保留 AuthState 形状与既有导出签名，useAuth / AuthCallback 无需改动
 */

import { SekaiAuth, SekaiAuthError } from '@25-ji-code-de/sekai-auth'
import { AuthUser, AuthState, OIDCUserInfo } from '../types'

const CLIENT_ID = import.meta.env.VITE_OAUTH_CLIENT_ID || ''
const REDIRECT_URI = import.meta.env.VITE_OAUTH_REDIRECT_URI || `${window.location.origin}/callback`
const SCOPE = import.meta.env.VITE_OAUTH_SCOPE || 'openid profile email'
const ISSUER = import.meta.env.VITE_OAUTH_ISSUER || 'https://id.nightcord.de5.net'

/** 迁移前把整包 AuthState 存成 JSON 的那个 key。 */
const LEGACY_BLOB_KEY = 'ayaka_auth_state'

const auth = new SekaiAuth({
  clientId: CLIENT_ID,
  redirectUri: REDIRECT_URI,
  scope: SCOPE,
  // 本仓是生态里唯一走 OIDC discovery 的（其余三个硬编码端点）
  issuer: ISSUER,
  storagePrefix: 'ayaka_',
  keys: {
    // 沿用迁移前的 PKCE key 名，避免部署瞬间正在跳转的登录流程失败
    codeVerifier: 'ayaka_pkce_verifier',
    state: 'ayaka_oauth_state',
  },
})

/**
 * 一次性迁移：把旧的单块 JSON blob 拆成 SDK 的离散 key。
 *
 * 不做这一步的话，上线瞬间所有已登录用户都会被登出。
 * 迁移后删掉 blob，因此只会执行一次。
 */
function migrateLegacyBlob(): void {
  let raw: string | null
  try {
    raw = localStorage.getItem(LEGACY_BLOB_KEY)
  } catch {
    return
  }
  if (!raw) return

  try {
    const legacy = JSON.parse(raw) as Partial<AuthState>
    if (legacy.accessToken && legacy.expiresAt) {
      localStorage.setItem(auth.keys.accessToken, legacy.accessToken)
      localStorage.setItem(auth.keys.expiresAt, String(legacy.expiresAt))
      if (legacy.refreshToken) {
        localStorage.setItem(auth.keys.refreshToken, legacy.refreshToken)
      }
      if (legacy.user) {
        // 旧 blob 存的是映射后的 AuthUser；这里回填成 userinfo 形状供缓存读取
        localStorage.setItem(
          auth.keys.user,
          JSON.stringify({
            sub: legacy.user.id,
            preferred_username: legacy.user.username,
            email: legacy.user.email ?? undefined,
            picture: legacy.user.avatar ?? undefined,
          }),
        )
      }
    }
  } catch {
    /* blob 损坏就当作未登录 */
  }

  try {
    localStorage.removeItem(LEGACY_BLOB_KEY)
  } catch {
    /* ignore */
  }
}

migrateLegacyBlob()

/** 把 OIDC userinfo 映射成本仓的 AuthUser。 */
function toAuthUser(userInfo: OIDCUserInfo): AuthUser {
  return {
    id: userInfo.sub,
    username: userInfo.preferred_username || userInfo.name || userInfo.sub,
    email: userInfo.email || null,
    avatar: userInfo.picture || null,
  }
}

/** 从 SDK 的离散存储还原出本仓的 AuthState 形状。 */
function readAuthState(user: AuthUser): AuthState {
  return {
    accessToken: localStorage.getItem(auth.keys.accessToken) ?? '',
    refreshToken: localStorage.getItem(auth.keys.refreshToken) ?? undefined,
    idToken: undefined,
    expiresAt: Number(localStorage.getItem(auth.keys.expiresAt) ?? 0),
    user,
  }
}

/** 取 userinfo 并映射；失败时抛出统一异常。 */
async function requireUser(): Promise<AuthUser> {
  const userInfo = await auth.getUserInfo({ cache: true })
  if (!userInfo) {
    throw new SekaiAuthError('Failed to fetch user info', { code: 'userinfo_failed' })
  }
  return toAuthUser(userInfo as unknown as OIDCUserInfo)
}

/**
 * 发起登录，跳转到授权端点（带 PKCE 参数）。
 */
export async function initiateLogin(): Promise<void> {
  try {
    await auth.login()
  } catch (err) {
    throw new Error(
      `Failed to initiate login: ${err instanceof Error ? err.message : 'Unknown error'}`,
    )
  }
}

/**
 * 处理 OAuth 回调，用 code 换 token。
 * @throws 换取失败或 state 不匹配时抛出
 */
export async function handleCallback(code: string, state: string): Promise<AuthState> {
  try {
    await auth.handleCallback(code, state)
    return readAuthState(await requireUser())
  } catch (err) {
    throw new Error(
      `Callback handling failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
    )
  }
}

/**
 * 用 refresh token 换新的 access token（single-flight，由 SDK 保证）。
 *
 * 参数保留是为了兼容既有签名 —— SDK 从存储里读 refresh token，不需要传入。
 * @throws 刷新失败时抛出，并清空本地状态
 */
export async function refreshAccessToken(_refreshToken?: string): Promise<AuthState> {
  const token = await auth.refresh()
  if (!token) {
    throw new Error('Token refresh failed')
  }
  return readAuthState(await requireUser())
}

/**
 * 登出：best-effort 撤销服务端 token，再清空本地。
 */
export function logout(): void {
  void auth.logout()
}

/**
 * 取当前认证状态。过期或即将过期（5 分钟内）时自动刷新。
 * @returns 未登录、或刷新失败时返回 null
 */
export async function getCurrentAuth(): Promise<AuthState | null> {
  // getAccessToken 内部已经处理了「快过期就提前刷新」和刷新失败清状态
  const token = await auth.getAccessToken()
  if (!token) return null

  const cached = auth.getCachedUser()
  const user = cached
    ? toAuthUser(cached as unknown as OIDCUserInfo)
    : await requireUser().catch(() => null)
  if (!user) return null

  return readAuthState(user)
}

/** 底层 SDK 实例，供需要新能力时直接使用。 */
export { auth as sekaiAuth }
