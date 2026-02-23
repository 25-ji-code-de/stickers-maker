import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon-32x32.png', 'favicon-16x16.png', 'apple-touch-icon.png', 'safari-pinned-tab.svg'],
      manifest: {
        name: 'Project SEKAI 贴纸生成器',
        short_name: 'SEKAI 贴纸',
        description: '为你喜欢的世界计划角色定制专属贴纸',
        theme_color: '#e4c2c8',
        background_color: '#433c3d',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // 增加文件大小限制（允许预缓存大字体文件）
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
        // 缓存策略
        runtimeCaching: [
          {
            // 缓存字体文件
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 年
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // 缓存图片资源（角色头像）
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 500, // 最多缓存 500 张图片（370+ 角色头像）
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 天
              }
            }
          },
          {
            // 缓存字体文件（本地字体）
            urlPattern: /\.(?:woff|woff2|ttf|otf)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 年
              }
            }
          },
          {
            // 缓存 JS 和 CSS
            urlPattern: /\.(?:js|css)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 天
              }
            }
          },
          {
            // 缓存 characters.json
            urlPattern: /\/characters\.json$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'data-cache',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 * 24 // 1 天
              }
            }
          }
        ],
        // 清理过期缓存
        cleanupOutdatedCaches: true,
        // 预缓存关键资源
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,woff,woff2}'
        ],
        // 跳过等待，立即激活新的 SW
        skipWaiting: true,
        clientsClaim: true,
      },
      devOptions: {
        enabled: false // 开发环境不启用 SW
      }
    })
  ],
  server: {
    port: 9000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 Material-UI 分离到单独的 chunk
          'mui': [
            '@mui/material',
            '@mui/icons-material',
            '@emotion/react',
            '@emotion/styled'
          ],
          // 将 fast-average-color 和 axios 分离
          'vendor': ['fast-average-color', 'axios'],
        },
      },
    },
    // 使用 terser 压缩（最佳压缩率）
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 移除所有 console
        drop_debugger: true, // 移除 debugger
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // 额外确保移除
        passes: 2, // 两次压缩获得更好效果
      },
      mangle: {
        safari10: true, // Safari 10 兼容
      },
    },
    target: 'es2015',
    // 提高 chunk 大小警告限制
    chunkSizeWarningLimit: 1000,
    // CSS 代码分割
    cssCodeSplit: true,
  },
});
