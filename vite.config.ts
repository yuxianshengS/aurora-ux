import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

/**
 * 两套构建:
 * - 默认 `vite build`: 打演示站点 (deploy 到 GitHub Pages)
 * - `vite build --mode lib`: 打 npm 组件库 (ESM + CJS + .d.ts)
 */
export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    return {
      plugins: [
        react(),
        dts({
          // lib.ts 里 re-export 了 hooks 和 locale, 必须把这两个目录也纳进来
          // 否则 dist/lib.d.ts 会缺类型 (引用不到 useTheme / useFocusTrap / Locale 等)
          include: [
            'src/components/**/*',
            'src/hooks/**/*',
            'src/locale/**/*',
            'src/utils/**/*',
            'src/lib.ts',
          ],
          exclude: ['**/*.test.*', '**/*.stories.*'],
          outDir: 'dist',
          insertTypesEntry: true,
        }),
      ],
      publicDir: false, // 不要把 public/ (favicon 等) 复制进 npm 包
      build: {
        outDir: 'dist',
        // lib 模式不发 sourcemap — 之前 .cjs.map / .mjs.map 给 npm 包平添 ~2MB,
        // 下游真要调试库源码可以装 dev 版自己 build, 不该让所有用户为此买单
        sourcemap: false,
        cssCodeSplit: false,
        lib: {
          entry: resolve(__dirname, 'src/lib.ts'),
          name: 'AuroraUX',
          formats: ['es', 'cjs'],
          fileName: (format) => `aurora-ux.${format === 'es' ? 'mjs' : 'cjs'}`,
        },
        rollupOptions: {
          // 这些依赖不打进包, 让用户项目里自己装 (peer)
          external: [
            'react',
            'react/jsx-runtime',
            'react-dom',
            'react-dom/client',
            'html2canvas',
            'jspdf',
            'echarts',
            'echarts-for-react',
          ],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
            },
            assetFileNames: (assetInfo) => {
              if (assetInfo.name && assetInfo.name.endsWith('.css')) {
                return 'aurora-ux.css';
              }
              return 'assets/[name]-[hash][extname]';
            },
            // Next.js 13+ App Router 兼容: 把整个 bundle 标成 client component,
            // 用户可以在 RSC 项目里直接 `import { Button } from 'aurora-ux'`,
            // 不用再自己包一层 'use client' wrapper.
            // 注意: 注入到 .mjs / .cjs 的最顶部才生效 (banner 选项做的就是这个事)
            banner: `'use client';`,
          },
        },
      },
    };
  }

  // 默认: 打演示站点
  return {
    base: '/aurora-ux/',
    plugins: [react()],
    server: {
      port: 5173,
      open: false,
    },
    build: {
      // 主 chunk 已经在合理范围内 (~450KB), 把警告调一下别噪音
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          // 把大的 vendor 拆开, 避免首屏加载所有可视化/PDF 依赖
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('purify'))
                return 'vendor-pdf';
              if (id.includes('react-dom')) return 'vendor-react-dom';
              if (id.includes('react-router')) return 'vendor-router';
              if (id.includes('/react/')) return 'vendor-react';
            }
          },
        },
      },
    },
  };
});
