/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 The 25-ji-code-de Team
 *
 * stickers-maker 迁移垫片的测试。
 *
 * 本仓是四个前端里唯一把整包 AuthState 存成单个 JSON blob 的
 * （其余三个用离散 key）。迁移到 SDK 的离散存储时如果不做转换，
 * 上线瞬间所有已登录用户都会被登出。
 *
 * auth.service.ts 是 TS + 依赖 import.meta.env，没法直接在 node 里 import，
 * 所以这里把迁移逻辑按同样的规则重现一遍并测它 —— 两边必须保持同步。
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { SekaiAuth } from '@25-ji-code-de/sekai-auth';

class MemoryStorage {
  constructor() {
    this.map = new Map();
  }
  getItem(k) {
    return this.map.has(k) ? this.map.get(k) : null;
  }
  setItem(k, v) {
    this.map.set(k, String(v));
  }
  removeItem(k) {
    this.map.delete(k);
  }
  clear() {
    this.map.clear();
  }
}

const local = new MemoryStorage();
const session = new MemoryStorage();
const LEGACY_BLOB_KEY = 'ayaka_auth_state';

function makeAuth() {
  return new SekaiAuth({
    clientId: 'maker_client',
    redirectUri: 'https://st.example/callback',
    endpoints: {
      authorize: 'https://id.example/oauth/authorize',
      token: 'https://id.example/oauth/token',
      userinfo: 'https://id.example/oauth/userinfo',
    },
    storagePrefix: 'ayaka_',
    keys: {
      codeVerifier: 'ayaka_pkce_verifier',
      state: 'ayaka_oauth_state',
    },
    localStorage: local,
    sessionStorage: session,
  });
}

/** 与 src/services/auth.service.ts 的 migrateLegacyBlob 保持一致。 */
function migrateLegacyBlob(auth) {
  const raw = local.getItem(LEGACY_BLOB_KEY);
  if (!raw) return;

  try {
    const legacy = JSON.parse(raw);
    if (legacy.accessToken && legacy.expiresAt) {
      local.setItem(auth.keys.accessToken, legacy.accessToken);
      local.setItem(auth.keys.expiresAt, String(legacy.expiresAt));
      if (legacy.refreshToken) {
        local.setItem(auth.keys.refreshToken, legacy.refreshToken);
      }
      if (legacy.user) {
        local.setItem(
          auth.keys.user,
          JSON.stringify({
            sub: legacy.user.id,
            preferred_username: legacy.user.username,
            email: legacy.user.email ?? undefined,
            picture: legacy.user.avatar ?? undefined,
          }),
        );
      }
    }
  } catch {
    /* 损坏就当未登录 */
  }

  local.removeItem(LEGACY_BLOB_KEY);
}

let auth;
beforeEach(() => {
  local.clear();
  session.clear();
  auth = makeAuth();
});

describe('storage key', () => {
  test('沿用 ayaka_ 前缀，PKCE key 与迁移前一致', () => {
    assert.equal(auth.keys.accessToken, 'ayaka_access_token');
    assert.equal(auth.keys.refreshToken, 'ayaka_refresh_token');
    assert.equal(auth.keys.expiresAt, 'ayaka_expires_at');
    assert.equal(auth.keys.user, 'ayaka_user');
    // 这两个是显式覆盖的，保证部署瞬间正在跳转的登录流程不会失败
    assert.equal(auth.keys.codeVerifier, 'ayaka_pkce_verifier');
    assert.equal(auth.keys.state, 'ayaka_oauth_state');
  });
});

describe('旧 blob 迁移', () => {
  const expiresAt = Date.now() + 60 * 60 * 1000;

  test('完整 blob 拆成离散 key，且不会登出用户', () => {
    local.setItem(
      LEGACY_BLOB_KEY,
      JSON.stringify({
        accessToken: 'AT',
        refreshToken: 'RT',
        expiresAt,
        user: { id: 'u1', username: 'ayaka', email: 'a@example.com', avatar: 'https://c/a.png' },
      }),
    );

    migrateLegacyBlob(auth);

    assert.equal(local.getItem('ayaka_access_token'), 'AT');
    assert.equal(local.getItem('ayaka_refresh_token'), 'RT');
    assert.equal(local.getItem('ayaka_expires_at'), String(expiresAt));
    assert.equal(auth.isAuthenticated(), true, '迁移后必须仍视为已登录');
  });

  test('user 被回填成 userinfo 形状供缓存读取', () => {
    local.setItem(
      LEGACY_BLOB_KEY,
      JSON.stringify({
        accessToken: 'AT',
        expiresAt,
        user: { id: 'u1', username: 'ayaka', email: 'a@example.com', avatar: 'https://c/a.png' },
      }),
    );

    migrateLegacyBlob(auth);

    assert.deepEqual(auth.getCachedUser(), {
      sub: 'u1',
      preferred_username: 'ayaka',
      email: 'a@example.com',
      picture: 'https://c/a.png',
    });
  });

  test('迁移后删除 blob —— 只执行一次', () => {
    local.setItem(LEGACY_BLOB_KEY, JSON.stringify({ accessToken: 'AT', expiresAt }));
    migrateLegacyBlob(auth);
    assert.equal(local.getItem(LEGACY_BLOB_KEY), null);

    // 第二次运行不应改变任何东西
    local.setItem('ayaka_access_token', 'NEWER');
    migrateLegacyBlob(auth);
    assert.equal(local.getItem('ayaka_access_token'), 'NEWER');
  });

  test('没有 refresh token 的 blob 也能迁移', () => {
    local.setItem(LEGACY_BLOB_KEY, JSON.stringify({ accessToken: 'AT', expiresAt }));
    migrateLegacyBlob(auth);
    assert.equal(local.getItem('ayaka_access_token'), 'AT');
    assert.equal(local.getItem('ayaka_refresh_token'), null);
    assert.equal(auth.isAuthenticated(), true);
  });

  test('blob 损坏时不抛异常，且照样清掉', () => {
    local.setItem(LEGACY_BLOB_KEY, '{not json');
    assert.doesNotThrow(() => migrateLegacyBlob(auth));
    assert.equal(local.getItem(LEGACY_BLOB_KEY), null);
    assert.equal(auth.isAuthenticated(), false);
  });

  test('缺 accessToken 的 blob 不写入任何东西', () => {
    local.setItem(LEGACY_BLOB_KEY, JSON.stringify({ refreshToken: 'RT', expiresAt }));
    migrateLegacyBlob(auth);
    assert.equal(local.getItem('ayaka_access_token'), null);
    assert.equal(auth.isAuthenticated(), false);
  });

  test('没有旧 blob 时是无操作', () => {
    assert.doesNotThrow(() => migrateLegacyBlob(auth));
    assert.equal(auth.isAuthenticated(), false);
  });

  test('已过期的 blob 迁移后仍算已登录（有 refresh token 可续期）', () => {
    local.setItem(
      LEGACY_BLOB_KEY,
      JSON.stringify({ accessToken: 'AT', refreshToken: 'RT', expiresAt: Date.now() - 1 }),
    );
    migrateLegacyBlob(auth);
    assert.equal(auth.isAuthenticated(), true);
  });
});
