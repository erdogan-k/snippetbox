import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Plus,
  Copy,
  Layers,
  Star,
  Braces,
  Code2,
  FileText,
  Clock,
  Trash2,
  Settings,
  SunMoon,
  Download,
  CornerDownLeft,
} from 'lucide-react';
import { InterfaceLanguage, NavSection, Snippet } from '../types/snippet';
import { translate } from '../i18n/translations';

interface CommandPaletteModalProps {
  isOpen: boolean;
  snippets: Snippet[];
  lang: InterfaceLanguage;
  onClose: () => void;
  onOpenSnippet: (snippet: Snippet) => void;
  onCopySnippet: (snippet: Snippet) => Promise<boolean>;
  onCreateSnippet: () => void;
  onNavigate: (section: NavSection) => void;
  onToggleTheme: () => void;
  onExportBackup: () => void;
}

interface PaletteItem {
  id: string;
  group: 'actions' | 'navigation' | 'snippets';
  label: string;
  subtitle?: string;
  icon: React.FC<{ className?: string }>;
  onSelect: () => void;
  onSecondaryCopy?: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  snippets,
  lang,
  onClose,
  onOpenSnippet,
  onCopySnippet,
  onCreateSnippet,
  onNavigate,
  onToggleTheme,
  onExportBackup,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = (key: string, params?: Record<string, string | number>) =>
    translate(lang, key, params);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [isOpen]);

  const items: PaletteItem[] = useMemo(() => {
    const q = query.trim().toLowerCase();

    const actionItems: PaletteItem[] = [
      {
        id: 'act-create',
        group: 'actions',
        label: t('palette.actionCreate'),
        subtitle: 'Ctrl+N',
        icon: Plus,
        onSelect: () => {
          onClose();
          onCreateSnippet();
        },
      },
      {
        id: 'act-theme',
        group: 'actions',
        label: t('palette.actionToggleTheme'),
        icon: SunMoon,
        onSelect: () => {
          onToggleTheme();
          onClose();
        },
      },
      {
        id: 'act-export',
        group: 'actions',
        label: t('palette.actionExportJson'),
        icon: Download,
        onSelect: () => {
          onExportBackup();
          onClose();
        },
      },
    ];

    const navSections: { section: NavSection; label: string; icon: React.FC<{ className?: string }> }[] = [
      { section: 'all', label: t('nav.all'), icon: Layers },
      { section: 'favorites', label: t('nav.favorites'), icon: Star },
      { section: 'templates', label: t('nav.templates'), icon: Braces },
      { section: 'code', label: t('nav.code'), icon: Code2 },
      { section: 'text', label: t('nav.text'), icon: FileText },
      { section: 'recent', label: t('nav.recent'), icon: Clock },
      { section: 'trash', label: t('nav.trash'), icon: Trash2 },
      { section: 'settings', label: t('nav.settings'), icon: Settings },
    ];

    const navItems: PaletteItem[] = navSections.map((n) => ({
      id: `nav-${n.section}`,
      group: 'navigation',
      label: n.label,
      icon: n.icon,
      onSelect: () => {
        onNavigate(n.section);
        onClose();
      },
    }));

    const activeSnippets = snippets.filter((s) => s.status === 'active');
    const snippetItems: PaletteItem[] = activeSnippets.map((s) => ({
      id: `snp-${s.id}`,
      group: 'snippets',
      label: s.title,
      subtitle: `${s.category} • ${s.tags.join(', ')}`,
      icon: s.type === 'code' ? Code2 : s.type === 'template' ? Braces : FileText,
      onSelect: () => {
        onClose();
        onOpenSnippet(s);
      },
      onSecondaryCopy: () => {
        void onCopySnippet(s);
        onClose();
      },
    }));

    const all = [...snippetItems, ...actionItems, ...navItems];
    if (!q) {
      return [...actionItems, ...snippetItems.slice(0, 8), ...navItems];
    }

    return all.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q))
    );
  }, [query, snippets, lang]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (items.length > 0 ? (prev + 1) % items.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          items.length > 0 ? (prev - 1 + items.length) % items.length : 0
        );
      } else if (e.key === 'Enter' && items[selectedIndex]) {
        e.preventDefault();
        const item = items[selectedIndex];
        if (e.shiftKey && item.onSecondaryCopy) {
          item.onSecondaryCopy();
        } else {
          item.onSelect();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, items, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/65 p-4 pt-16 sm:pt-24 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={t('header.commandPalette')}
    >
      <div className="flex max-h-[75vh] w-full max-w-xl flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-surface-900">
        {/* Search Input */}
        <div className="flex items-center border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <Search className="h-4 w-4 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('palette.placeholder')}
            className="ml-3 flex-1 bg-transparent text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none dark:text-zinc-100"
          />
          <kbd className="rounded border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 dark:border-zinc-700 dark:bg-surface-800 dark:text-zinc-400">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-2">
          {items.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-500">
              {t('palette.noResults')}
            </div>
          ) : (
            <ul className="space-y-0.5">
              {items.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <li key={item.id}>
                    <div
                      onClick={() => item.onSelect()}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between rounded-md px-3 py-2 text-sm cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-indigo-600/10 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200'
                          : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Icon className="h-4 w-4 shrink-0 text-zinc-400" />
                        <div className="truncate">
                          <span className="font-medium">{item.label}</span>
                          {item.subtitle && (
                            <span className="ml-2 text-xs text-zinc-400 dark:text-zinc-500">
                              {item.subtitle}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="ml-2 flex shrink-0 items-center gap-1.5">
                        {item.onSecondaryCopy && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              item.onSecondaryCopy?.();
                            }}
                            className="inline-flex items-center gap-1 rounded border border-zinc-300 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-surface-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                          >
                            <Copy className="h-3 w-3" />
                            <span>{t('palette.copyHint')}</span>
                          </button>
                        )}
                        <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
                          <CornerDownLeft className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
