import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CommandPalette, { type CommandItem } from '../components/CommandPalette';
import { navGroups } from '../data/nav';

export const OPEN_DOCS_SEARCH_EVENT = 'aurora:open-docs-search';

export const openDocsSearch = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(OPEN_DOCS_SEARCH_EVENT));
  }
};

const TOP_LEVEL: Array<Omit<CommandItem, 'onSelect'>> = [
  { id: '/', title: '首页', description: '/', group: '页面', keywords: ['home', '主页'] },
  {
    id: '/examples/dashboard',
    title: 'Dashboard 示例',
    description: '/examples/dashboard',
    group: '示例',
    keywords: ['dashboard', '看板'],
  },
  {
    id: '/examples/screen',
    title: '大屏示例',
    description: '/examples/screen',
    group: '示例',
    keywords: ['screen', 'bigscreen', '大屏'],
  },
  {
    id: '/builder',
    title: 'Builder · 拖拽搭建',
    description: '/builder',
    group: '工具',
    keywords: ['builder', '搭建'],
  },
];

const DocsSearch: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(OPEN_DOCS_SEARCH_EVENT, handler);
    return () => window.removeEventListener(OPEN_DOCS_SEARCH_EVENT, handler);
  }, []);

  const items = useMemo<CommandItem[]>(() => {
    const docs: CommandItem[] = navGroups.flatMap((g) =>
      g.items.map((it) => ({
        id: it.path,
        title: it.title,
        description: it.path,
        group: g.title,
      })),
    );
    const all = [...TOP_LEVEL, ...docs];
    return all.map((it) => ({
      ...it,
      onSelect: () => {
        navigate(it.id.startsWith('/') ? it.id : `/${it.id}`);
      },
    }));
  }, [navigate]);

  return (
    <CommandPalette
      items={items}
      open={open}
      onOpenChange={setOpen}
      placeholder="搜索组件 / 页面…"
    />
  );
};

export default DocsSearch;
