/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 The 25-ji-code-de Team
 */

/**
 * JWT payload 里的非 ASCII 必须解得出来。
 *
 * ── 由来 ────────────────────────────────────────────────────────
 *
 * 用「同一个概念有多份实现就让它们各跑一遍比对」的办法扫生态，发现解 JWT
 * payload 有四处实现，而本仓这份少了一步：
 *
 *     return atob(base64)      // ← 到此为止
 *
 * `atob` 返回的是**字节串**（每字符一字节），对多字节 UTF-8 直接
 * `JSON.parse` 得到乱码 —— `なこ` 解出来是 `ãªã`。
 *
 * 另外三处（sekai-auth / sekai-pass / puzzle-sekai）都做了
 * `Uint8Array.from(binary, c => c.charCodeAt(0))` + `TextDecoder`。
 *
 * 本文件此前**没有任何调用点**，所以不是活的 bug —— 但下一个需要解 JWT
 * 的人 import 它，昵称就会静默变乱码。已在本地补上缺的那一步（SDK 的正确
 * 实现要等 v0.2.0 发布才能直接用，见下面「解码实现本身」一节）。
 */

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { parseJWT, isTokenExpired } from '../src/utils/jwt.utils.ts'

/** 造一个 payload 为给定对象的 JWT（签名段是占位，本模块不验签）。 */
function makeToken(payload) {
  const b64u = (s) =>
    Buffer.from(s, 'utf8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  return `${b64u(JSON.stringify({ alg: 'ES256', typ: 'JWT' }))}.${b64u(JSON.stringify(payload))}.sig`
}

describe('非 ASCII 的 claim', () => {
  test('日文昵称解得回原文', () => {
    const p = parseJWT(makeToken({ sub: 'u1', name: 'なこ' }))
    assert.equal(p.name, 'なこ', `解成了 ${JSON.stringify(p.name)}`)
  })

  test('中文标点与全角字符', () => {
    const src = '25時、コードで。'
    assert.equal(parseJWT(makeToken({ sub: 'u1', preferred_username: src })).preferred_username, src)
  })

  test('emoji（四字节）', () => {
    assert.equal(parseJWT(makeToken({ sub: 'u1', name: '🌙🌃' })).name, '🌙🌃')
  })

  test('混合内容一字不差', () => {
    const payload = {
      sub: 'u1',
      name: 'なこ',
      preferred_username: '25時、コードで。',
      email: 'a@example.test',
      emoji: '🌙',
    }
    assert.deepEqual(parseJWT(makeToken(payload)), payload)
  })

  test('纯 ASCII 仍然正确（不能为了修 UTF-8 把简单情形弄坏）', () => {
    assert.deepEqual(parseJWT(makeToken({ sub: 'u1', email: 'a@b.c' })), {
      sub: 'u1',
      email: 'a@b.c',
    })
  })
})

describe('base64url 的边界', () => {
  test('三种 padding 长度都解得开', () => {
    // payload 长度 mod 3 取遍 0/1/2，对应 base64 需要补 0/2/1 个 '='
    for (const pad of ['', 'a', 'ab']) {
      const p = parseJWT(makeToken({ sub: 'u1', x: `なこ${pad}` }))
      assert.equal(p.x, `なこ${pad}`, `padding 情形 ${JSON.stringify(pad)} 解错了`)
    }
  })

  test('- 与 _ 被正确还原成 + 与 /', () => {
    /*
     * base64url 把 base64 的 `+` `/` 换成 `-` `_`。这条要确保还原那一步没漏。
     *
     * 第一版用「重复 'あ' 直到编码里同时出现 - 和 _」来造样本，200 次没找到，
     * 于是断言直接失败。改成按字节搜：`+`/`/` 对应 sextet 62/63，
     * 随便撞几组字节就能凑出来 —— 但必须**断言真的凑出来了**，
     * 否则这条就是空跑。
     */
    let sample = null
    for (let seed = 0; seed < 500 && !sample; seed++) {
      const v = String.fromCharCode(...[0xff, 0xfe, 0xfd, seed % 256, (seed * 7) % 256])
      const seg = makeToken({ sub: 'u1', v }).split('.')[1]
      if (seg.includes('-') && seg.includes('_')) sample = { sub: 'u1', v }
    }
    assert.ok(sample, '造不出同时含 - 和 _ 的样本 —— 这条测不到东西')
    const seg = makeToken(sample).split('.')[1]
    assert.ok(seg.includes('-') && seg.includes('_'), '样本无效')
    assert.deepEqual(parseJWT(makeToken(sample)), sample)
  })
})

describe('错误处理的契约没变', () => {
  test('段数不对时抛', () => {
    for (const bad of ['', 'a', 'a.b', 'a.b.c.d']) {
      assert.throws(() => parseJWT(bad), /Failed to parse JWT/, JSON.stringify(bad))
    }
  })

  test('两段但第二段恰好是合法 JSON —— 仍然要拒', () => {
    /*
     * 上面那条其实测不到段数检查：那些输入即使跳过检查，也会在
     * base64/JSON 那一步抛，报的还是同一句话。反向验证发现了这点 ——
     * 把段数检查整个删掉，上面那条照样绿。
     *
     * 这条才真的需要它：`header.<合法 payload>` 只有两段，
     * 跳过检查的话会**解析成功**并返回一个对象 —— 一个不是 JWT 的东西
     * 被当成了 JWT。
     */
    const payloadSeg = Buffer.from(JSON.stringify({ sub: 'u1' }), 'utf8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
    const twoParts = `aGVhZGVy.${payloadSeg}`
    assert.equal(twoParts.split('.').length, 2, '前置条件：确实只有两段')
    assert.throws(() => parseJWT(twoParts), /Failed to parse JWT/)
  })

  test('payload 不是合法 JSON 时抛', () => {
    assert.throws(() => parseJWT('aGVhZGVy.bm90LWpzb24.sig'), /Failed to parse JWT/)
  })

  test('isTokenExpired：解析失败当作已过期', () => {
    assert.equal(isTokenExpired('garbage'), true)
  })

  test('isTokenExpired：没有 exp 当作未过期', () => {
    assert.equal(isTokenExpired(makeToken({ sub: 'u1' })), false)
  })

  test('isTokenExpired：过去与未来', () => {
    const now = Math.floor(Date.now() / 1000)
    assert.equal(isTokenExpired(makeToken({ sub: 'u1', exp: now - 1 })), true)
    assert.equal(isTokenExpired(makeToken({ sub: 'u1', exp: now + 3600 })), false)
  })
})

describe('解码实现本身', () => {
  /*
   * 本仓依赖的是 sekai-auth#v0.1.2，而它的 `decodeJwtPayload` 是 v0.2.0
   * 才导出的（还在未合并的 PR 里）。所以这里保留本地实现，只补上缺的那一步。
   *
   * 我第一版直接改成 `import { decodeJwtPayload } from '@25-ji-code-de/sekai-auth'`，
   * 测试立刻报 "does not provide an export named" —— **不能让本仓依赖
   * 未发布的代码**。SDK 升上去之后可以整个换过去，下面这批测试会保证
   * 换过去之后行为不变。
   */
  const src = (() => {
    const root = join(dirname(fileURLToPath(import.meta.url)), '..')
    return readFileSync(join(root, 'src/utils/jwt.utils.ts'), 'utf8')
  })()

  /** 剥注释 —— 解释「为什么」的注释里当然会提到 atob。 */
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')

  test('atob 之后必须过 TextDecoder', () => {
    assert.match(code, /\batob\s*\(/, '前置条件：仍然用 atob 拿字节串')
    assert.match(
      code,
      /Uint8Array\.from\([\s\S]{0,80}charCodeAt\(0\)\)/,
      '没有把字节串还原成字节数组',
    )
    assert.match(code, /new TextDecoder\(\)\.decode\(/, '没有按 UTF-8 解码')
  })

  test('顺序对：先 atob，再 Uint8Array，再 TextDecoder', () => {
    const a = code.indexOf('atob(')
    const u = code.indexOf('Uint8Array.from(')
    const t = code.indexOf('TextDecoder')
    assert.ok(a >= 0 && u > a && t > u, `顺序不对：atob@${a} Uint8Array@${u} TextDecoder@${t}`)
  })

  test('没有第二处直接 return atob(...) 的路径', () => {
    assert.doesNotMatch(code, /return\s+atob\s*\(/, '还有一条直接返回字节串的路径')
  })
})
