import React from 'react';
import {
  Layers,
  Star,
  Braces,
  Code2,
  FileText,
  Clock,
  Trash2,
  Settings,
  Folder,
  FolderCog,
  Terminal,
  X,
} from 'lucide-react';
import { CategoryItem, InterfaceLanguage, NavSection, Snippet } from '../types/snippet';
import { translate } from '../i18n/translations';

interface SidebarProps {
  activeSection: NavSection;
  selectedCategory: string | 'ALL';
  categories: CategoryItem[];
  snippets: Snippet[];
  lang: InterfaceLanguage;
  isOpenMobile: boolean;
  onSelectSection: (section: NavSection) => void;
  onSelectCategory: (category: string | 'ALL') => void;
  onOpenCategoryManager: () => void;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  selectedCategory,
  categories,
  snippets,
  lang,
  isOpenMobile,
  onSelectSection,
  onSelectCategory,
  onOpenCategoryManager,
  onCloseMobile,
}) => {
  const t = (key: string, params?: Record<string, string | number>) =>
    translate(lang, key, params);

  const activeSnippets = snippets.filter((s) => s.status === 'active');
  const trashedCount = snippets.filter((s) => s.status === 'trashed').length;

  const counts = {
    all: activeSnippets.length,
    favorites: activeSnippets.filter((s) => s.isFavorite).length,
    templates: activeSnippets.filter((s) => s.type === 'template').length,
    code: activeSnippets.filter((s) => s.type === 'code').length,
    text: activeSnippets.filter((s) => s.type === 'text' || s.type === 'link').length,
    recent: activeSnippets.filter((s) => s.lastUsedAt && s.usageCount > 0).length,
    trash: trashedCount,
  };

  const getCategoryCount = (catName: string) =>
    activeSnippets.filter((s) => s.category.toLowerCase() === catName.toLowerCase()).length;

  const getCategoryDisplayName = (catName: string) => {
    const key = `cat.${catName}`;
    const localized = t(key);
    return localized !== key ? localized : catName;
  };

  const navItems: {
    id: NavSection;
    label: string;
    icon: React.FC<{ className?: string }>;
    count?: number;
  }[] = [
    { id: 'all', label: t('nav.all'), icon: Layers, count: counts.all },
    { id: 'favorites', label: t('nav.favorites'), icon: Star, count: counts.favorites },
    { id: 'templates', label: t('nav.templates'), icon: Braces, count: counts.templates },
    { id: 'code', label: t('nav.code'), icon: Code2, count: counts.code },
    { id: 'text', label: t('nav.text'), icon: FileText, count: counts.text },
    { id: 'recent', label: t('nav.recent'), icon: Clock, count: counts.recent },
    { id: 'trash', label: t('nav.trash'), icon: Trash2, count: counts.trash },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
  ];

  const handleNavClick = (section: NavSection) => {
    onSelectSection(section);
    onCloseMobile();
  };

  const handleCategoryClick = (catName: string | 'ALL') => {
    if (activeSection === 'settings' || activeSection === 'trash') {
      onSelectSection('all');
    }
    onSelectCategory(catName);
    onCloseMobile();
  };

  const sidebarContent = (
    <aside
      aria-label={t('nav.library')}
      className="flex h-full w-64 flex-col border-r border-zinc-200 bg-zinc-100/80 text-zinc-800 select-none dark:border-zinc-800/80 dark:bg-surface-900 dark:text-zinc-200"
    >
      {/* Brand header */}
      <div className="flex h-14 items-center justify-between border-b border-zinc-200/80 px-4 dark:border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 bg-zinc-900 text-indigo-400 dark:border-zinc-700 dark:bg-surface-800">
            <Terminal className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {t('app.name')}
            </span>
            <span className="ml-1.5 rounded bg-zinc-200/80 px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              LOCAL
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label={t('header.closeMenu')}
          className="rounded-md p-1 text-zinc-500 hover:bg-zinc-200 lg:hidden dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        <div>
          <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
            {t('nav.library')}
          </div>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isActive
                      ? 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300'
                      : 'text-zinc-700 hover:bg-zinc-200/70 dark:text-zinc-300 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-zinc-500 dark:text-zinc-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {typeof item.count === 'number' && (
                    <span
                      className={`ml-2 rounded px-1.5 py-0.2 font-mono text-xs ${
                        isActive
                          ? 'bg-indigo-600/15 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
                          : 'text-zinc-500 dark:text-zinc-500'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Categories List */}
        <div>
          <div className="flex items-center justify-between px-2 pb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
              {t('nav.categories')}
            </span>
            <button
              type="button"
              onClick={onOpenCategoryManager}
              title={t('nav.manageCategories')}
              aria-label={t('nav.manageCategories')}
              className="rounded p-1 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <FolderCog className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => handleCategoryClick('ALL')}
              className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                selectedCategory === 'ALL' &&
                activeSection !== 'settings' &&
                activeSection !== 'trash'
                  ? 'bg-zinc-200/90 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                  : 'text-zinc-600 hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:bg-zinc-800/50'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <Folder className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                <span className="truncate">{t('nav.allCategories')}</span>
              </span>
              <span className="font-mono text-[11px] text-zinc-500">{counts.all}</span>
            </button>

            {categories.map((cat) => {
              const count = getCategoryCount(cat.name);
              const isSelected =
                selectedCategory.toLowerCase() === cat.name.toLowerCase() &&
                activeSection !== 'settings' &&
                activeSection !== 'trash';
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.name)}
                  className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isSelected
                      ? 'bg-zinc-200/90 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                      : 'text-zinc-600 hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <Folder
                      className={`h-3.5 w-3.5 shrink-0 ${
                        isSelected ? 'text-indigo-500' : 'text-zinc-400 dark:text-zinc-500'
                      }`}
                    />
                    <span className="truncate">{getCategoryDisplayName(cat.name)}</span>
                  </span>
                  <span className="font-mono text-[11px] text-zinc-500">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Keyboard Shortcut Footer Hint */}
      <div className="border-t border-zinc-200/80 px-4 py-3 text-[11px] text-zinc-500 dark:border-zinc-800/80 dark:text-zinc-500">
        <div className="flex items-center justify-between">
          <span>{t('header.commandPalette')}</span>
          <kbd className="rounded border border-zinc-300 bg-white px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 dark:border-zinc-700 dark:bg-surface-800 dark:text-zinc-300">
            Ctrl+K
          </kbd>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:shrink-0">{sidebarContent}</div>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-40 flex lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 flex h-full w-64 flex-col">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
