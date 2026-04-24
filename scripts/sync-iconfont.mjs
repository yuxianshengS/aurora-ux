#!/usr/bin/env node
/**
 * 同步阿里 iconfont 字体图标到本项目。
 *
 * 用法:
 *   node scripts/sync-iconfont.mjs <css_url>
 *   pnpm sync:icon <css_url>
 *
 * 示例:
 *   pnpm sync:icon "https://at.alicdn.com/t/c/font_4644876_abcdef.css"
 *
 * 做两件事:
 *   1. 替换 index.html 里 iconfont 的 <link> URL
 *   2. 重新生成 src/data/iconfontNames.ts 图标清单
 */

import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const INDEX_HTML = resolve(ROOT, 'index.html');
const NAMES_TS = resolve(ROOT, 'src/data/iconfontNames.ts');

const rawArg = process.argv[2];
if (!rawArg) {
  console.error('用法: node scripts/sync-iconfont.mjs <css_url>');
  console.error('例如: node scripts/sync-iconfont.mjs "https://at.alicdn.com/t/c/font_4644876_xxxxx.css"');
  process.exit(1);
}

// 去掉查询参数、强制 https
const url = new URL(rawArg.trim());
url.search = '';
if (url.protocol === 'http:') url.protocol = 'https:';
const cleanUrl = url.toString();

console.log(`→ 拉取 ${cleanUrl}`);

const res = await fetch(cleanUrl);
if (!res.ok) {
  console.error(`拉取失败: HTTP ${res.status}`);
  process.exit(1);
}
const css = await res.text();

// 提取 .icon-xxx 名字
const names = Array.from(
  new Set(Array.from(css.matchAll(/\.icon-([a-zA-Z0-9_-]+)/g), (m) => m[1]))
).sort();

if (names.length === 0) {
  console.error('未从 CSS 中解析到任何 icon 名称,请检查 URL 是否正确');
  process.exit(1);
}

// 1) 更新 index.html 里的 iconfont link
let html = await readFile(INDEX_HTML, 'utf8');
const linkRegex = /<link\s+rel="stylesheet"\s+href="https?:\/\/at\.alicdn\.com\/t\/c\/font_[^"]+"\s*\/?>/;
const newLink = `<link rel="stylesheet" href="${cleanUrl}" />`;

if (linkRegex.test(html)) {
  html = html.replace(linkRegex, newLink);
  console.log('→ 已更新 index.html 的 iconfont <link>');
} else {
  // 找不到旧的就插在 favicon 后面
  html = html.replace(
    /(<link rel="icon"[^>]*\/>\s*)/,
    `$1    ${newLink}\n    `
  );
  console.log('→ 已在 index.html 插入 iconfont <link>');
}
await writeFile(INDEX_HTML, html);

// 2) 重写 src/data/iconfontNames.ts
const header = `// 由 scripts/sync-iconfont.mjs 自动生成,勿手动编辑。\n// 源: ${cleanUrl}\n\n`;
const body = `export const iconfontNames: string[] = [\n${names
  .map((n) => `  '${n}',`)
  .join('\n')}\n];\n`;
await writeFile(NAMES_TS, header + body);
console.log(`→ 已写入 src/data/iconfontNames.ts (${names.length} 个图标)`);

console.log('\n✔ 同步完成');
