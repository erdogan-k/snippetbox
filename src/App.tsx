import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Search,
  Plus,
  Command,
  Menu,
  Sun,
  Moon,
  LayoutGrid,
  List,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  Trash2,
  Star,
  X,
  BookOpen,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  AppPreferences,
  CategoryItem,
  NavSection,
  Snippet,
  SnippetInput,
  SnippetType,
  SortDirection,
  SortField,
} from './types/snippet';
import {
  clearAllData,
  createCategory,
  createSnippet,
   DEFAULT_PREFERENCES,
  deleteCategory,
  duplicateSnippet,
  emptyTrash,
  ensureInitialCategories,
  executeImportBundle,
  exportDatabaseBundle,
  getAllSnippets,
   getPreferences,
  moveSnippetToTrash,
  permanentlyDeleteSnippet,
  recordSnippetUsage,
  renameCategory,
  restoreSnippetFromTrash,
  savePreferences,
  toggleSnippetFavorite,
  updateSnippet,
} from './services/db';
import { filterAndSortSnippets } from './utils/searchAndFilter';
import { copyTextToClipboard } from './utils/clipboard';
import {
  formatSnippetExportContent,
  getSnippetExportFilename,
  parsePlainTextFileToSnippet,
  triggerFileDownload,
} from './utils/fileExport';
import { SAMPLE_SNIPPETS } from './data/sampleSnippets';
import { translate } from './i18n/translations';
import { Sidebar } from './components/Sidebar';
import { SnippetCard } from './components/SnippetCard';
import { SnippetEditorModal } from './components/SnippetEditorModal';
import { TemplateWorkbenchModal } from './components/TemplateWorkbenchModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { SettingsView } from './components/SettingsView';
import { ConfirmDialog } from './components/ConfirmDialog';

interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error';
}

export const App: React.FC = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [preferences, setPreferences] = useState<AppPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);

  // Navigation & Filter State
  const [activeSection, setActiveSection] = useState<NavSection>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'ALL'>('ALL');
  const [selectedType, setSelectedType] = useState<SnippetType | 'ALL'>('ALL');
  const [selectedTag, setSelectedTag] = useState<string | 'ALL'>('ALL');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<SortField>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Modals & Drawers
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [workbenchSnippet, setWorkbenchSnippet] = useState<Snippet | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Confirmation Dialog State
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const lang = preferences.language;
  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      translate(lang, key, params),
    [lang]
  );

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToast({ id: String(Date.now()), text, type });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  // Initial Database Load
  const reloadAllData = useCallback(async () => {
    try {
      const [loadedCategories, loadedSnippets, loadedPrefs] = await Promise.all([
        ensureInitialCategories(),
        getAllSnippets(),
        getPreferences(),
      ]);
      setCategories(loadedCategories);
      setSnippets(loadedSnippets);
      setPreferences(loadedPrefs);
      setStorageError(null);
      return loadedPrefs;
    } catch (err) {
      setStorageError(
        err instanceof Error ? err.message : 'Failed to access browser IndexedDB storage'
      );
      return DEFAULT_PREFERENCES;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoading(true);
      const prefs = await reloadAllData();
      if (mounted) {
        setActiveSection(prefs.defaultView || 'all');
        setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [reloadAllData]);

  // Apply Theme (Dark, Light, System)
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    if (preferences.theme === 'dark') {
      applyTheme(true);
      return;
    }
    if (preferences.theme === 'light') {
      applyTheme(false);
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    applyTheme(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => applyTheme(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [preferences.theme]);

  // Global Keyboard Shortcuts: '/', 'Ctrl/Cmd + K', 'Ctrl/Cmd + N'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTypingField =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      // Ctrl/Cmd + K -> Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Ctrl/Cmd + N -> Create Snippet (when not inside another modal)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n' && !isEditorOpen) {
        e.preventDefault();
        setEditingSnippet(null);
        setIsEditorOpen(true);
        return;
      }

      // '/' -> Focus search input when not typing in an input field
      if (
        e.key === '/' &&
        !isTypingField &&
        !isEditorOpen &&
        !isCommandPaletteOpen &&
        !workbenchSnippet
      ) {
        e.preventDefault();
        if (activeSection === 'settings') {
          setActiveSection('all');
        }
        setTimeout(() => searchInputRef.current?.focus(), 10);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditorOpen, isCommandPaletteOpen, workbenchSnippet, activeSection]);

  // Available unique tags across active snippets
  const allAvailableTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const s of snippets) {
      if (s.status === 'active') {
        for (const tag of s.tags) {
          tagSet.add(tag);
        }
      }
    }
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }, [snippets]);

  // Filtered and Sorted Snippets
  const displayedSnippets = useMemo(() => {
    return filterAndSortSnippets(snippets, {
      query: searchQuery,
      section: activeSection,
      category: selectedCategory,
      type: selectedType,
      tag: selectedTag,
      onlyFavorites,
      sortBy,
      sortDirection,
    });
  }, [
    snippets,
    searchQuery,
    activeSection,
    selectedCategory,
    selectedType,
    selectedTag,
    onlyFavorites,
    sortBy,
    sortDirection,
  ]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedCategory !== 'ALL' ||
    selectedType !== 'ALL' ||
    selectedTag !== 'ALL' ||
    onlyFavorites;

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedType('ALL');
    setSelectedTag('ALL');
    setOnlyFavorites(false);
  };

  // Preference Handlers
  const handleUpdatePreferences = async (partial: Partial<AppPreferences>) => {
    const updated = await savePreferences(partial);
    setPreferences(updated);
  };

  const handleToggleQuickTheme = () => {
    const nextTheme = preferences.theme === 'dark' ? 'light' : 'dark';
    void handleUpdatePreferences({ theme: nextTheme });
  };

  // Snippet CRUD & Copy Handlers
  const handleCopySnippet = async (snippet: Snippet): Promise<boolean> => {
    const res = await copyTextToClipboard(snippet.content);
    if (!res.ok) {
      showToast(t('toast.copyError', { error: res.error || 'Denied' }), 'error');
      return false;
    }
    const updated = await recordSnippetUsage(snippet.id);
    setSnippets((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    if (workbenchSnippet?.id === updated.id) {
      setWorkbenchSnippet(updated);
    }
    showToast(t('toast.copied', { title: snippet.title }), 'success');
    return true;
  };

  const handleCopyCustomText = async (
    text: string,
    snippetId: string,
    isRenderedTemplate: boolean
  ): Promise<boolean> => {
    const res = await copyTextToClipboard(text);
    if (!res.ok) {
      showToast(t('toast.copyError', { error: res.error || 'Denied' }), 'error');
      return false;
    }
    const updated = await recordSnippetUsage(snippetId);
    setSnippets((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    if (workbenchSnippet?.id === updated.id) {
      setWorkbenchSnippet(updated);
    }
    showToast(
      isRenderedTemplate
        ? t('toast.copiedRendered')
        : t('toast.copied', { title: updated.title }),
      'success'
    );
    return true;
  };

  const handleSaveSnippet = async (input: SnippetInput, existingId?: string) => {
    if (existingId) {
      const updated = await updateSnippet(existingId, input);
      setSnippets((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      showToast(t('toast.snippetUpdated'));
    } else {
      const created = await createSnippet(input);
      setSnippets((prev) => [created, ...prev]);
      showToast(t('toast.snippetCreated'));
    }
  };

  const handleDuplicateSnippet = async (snippet: Snippet) => {
    const duplicated = await duplicateSnippet(snippet.id);
    setSnippets((prev) => [duplicated, ...prev]);
    showToast(t('toast.snippetDuplicated'));
  };

  const handleToggleFavorite = async (snippet: Snippet) => {
    const updated = await toggleSnippetFavorite(snippet.id);
    setSnippets((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleMoveToTrash = async (snippet: Snippet) => {
    const updated = await moveSnippetToTrash(snippet.id);
    setSnippets((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    showToast(t('toast.movedToTrash'));
  };

  const handleRestoreFromTrash = async (snippet: Snippet) => {
    const updated = await restoreSnippetFromTrash(snippet.id);
    setSnippets((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    showToast(t('toast.restored'));
  };

  const handleRequestPermanentDelete = (snippet: Snippet) => {
    setConfirmState({
      isOpen: true,
      title: t('confirm.deleteSnippetTitle'),
      description: t('confirm.deleteSnippetDesc'),
      onConfirm: async () => {
        await permanentlyDeleteSnippet(snippet.id);
        setSnippets((prev) => prev.filter((s) => s.id !== snippet.id));
        setConfirmState(null);
        showToast(t('toast.deletedPermanently'));
      },
    });
  };

  const handleRequestEmptyTrash = () => {
    setConfirmState({
      isOpen: true,
      title: t('confirm.emptyTrashTitle'),
      description: t('confirm.emptyTrashDesc'),
      onConfirm: async () => {
        const removedCount = await emptyTrash();
        setSnippets((prev) => prev.filter((s) => s.status !== 'trashed'));
        setConfirmState(null);
        showToast(t('toast.trashEmptied', { count: removedCount }));
      },
    });
  };

  // Sample Demo Dataset Loader (only on explicit user action)
  const handleLoadSampleSnippets = async () => {
    const createdItems: Snippet[] = [];
    for (const sample of SAMPLE_SNIPPETS) {
      const created = await createSnippet(sample);
      createdItems.push(created);
    }
    setSnippets((prev) => [...createdItems, ...prev]);
    showToast(t('settings.demoAlreadyLoaded'));
  };

  // Category Handlers
  const handleCreateCategory = async (name: string) => {
    const created = await createCategory(name);
    setCategories((prev) => [...prev, created]);
  };

  const handleRenameCategory = async (id: string, newName: string) => {
    const oldCat = categories.find((c) => c.id === id);
    const { category } = await renameCategory(id, newName);
    setCategories((prev) => prev.map((c) => (c.id === id ? category : c)));
    if (
      oldCat &&
      selectedCategory !== 'ALL' &&
      selectedCategory.toLowerCase() === oldCat.name.toLowerCase()
    ) {
      setSelectedCategory(category.name);
    }
    const refreshedSnippets = await getAllSnippets();
    setSnippets(refreshedSnippets);
  };

  const handleDeleteCategory = async (id: string) => {
    const targetCat = categories.find((c) => c.id === id);
    const { movedSnippetsCount } = await deleteCategory(id, 'General');
    setCategories((prev) => prev.filter((c) => c.id !== id));
    if (
      targetCat &&
      selectedCategory !== 'ALL' &&
      selectedCategory.toLowerCase() === targetCat.name.toLowerCase()
    ) {
      setSelectedCategory('ALL');
    }
    const refreshedSnippets = await getAllSnippets();
    setSnippets(refreshedSnippets);
    showToast(t('category.deletedMovedToast', { count: movedSnippetsCount }));
  };

  // Export & Import Handlers
  const handleExportFullBackup = async () => {
    const bundle = await exportDatabaseBundle();
    const dateStamp = new Date().toISOString().slice(0, 10);
    const filename = `snippetbox-backup-${dateStamp}.json`;
    triggerFileDownload(
      JSON.stringify(bundle, null, 2),
      filename,
      'application/json;charset=utf-8'
    );
    showToast(t('toast.exportedJson'));
  };

  const handleExportIndividualSnippet = (
    snippet: Snippet,
    format: 'auto' | 'md' = 'auto'
  ) => {
    const filename = getSnippetExportFilename(snippet, format);
    const content = formatSnippetExportContent(
      snippet,
      format === 'md' ? 'md' : 'raw'
    );
    triggerFileDownload(content, filename);
    showToast(t('toast.exportedFile', { filename }));
  };

  const handleExecuteImportBundle = async (
    incomingSnippets: Snippet[],
    incomingCategories: CategoryItem[],
    mode: 'merge' | 'replace'
  ) => {
    const result = await executeImportBundle(
      incomingSnippets,
      incomingCategories,
      mode
    );
    await reloadAllData();
    return result;
  };

  const handleImportPlainTextFile = async (filename: string, content: string) => {
    const parsedInput = parsePlainTextFileToSnippet(
      filename,
      content,
      preferences.defaultCategory
    );
    const created = await createSnippet(parsedInput);
    setSnippets((prev) => [created, ...prev]);
    showToast(t('toast.importedTextFile', { title: created.title }));
  };

  const handleRequestClearAllData = () => {
    setConfirmState({
      isOpen: true,
      title: t('confirm.clearAllTitle'),
      description: t('confirm.clearAllDesc'),
      onConfirm: async () => {
        await clearAllData();
        await reloadAllData();
        setConfirmState(null);
        showToast(t('toast.clearedAll'));
      },
    });
  };

  const getCategoryDisplayName = (catName: string) => {
    const key = `cat.${catName}`;
    const localized = t(key);
    return localized !== key ? localized : catName;
  };

  const activeNonTrashedCount = snippets.filter((s) => s.status === 'active').length;
  const trashedCount = snippets.filter((s) => s.status === 'trashed').length;

  const initialEditorType: SnippetType =
    activeSection === 'code'
      ? 'code'
      : activeSection === 'templates'
      ? 'template'
      : 'text';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50 text-zinc-900 dark:bg-surface-950 dark:text-zinc-100">
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeSection={activeSection}
        selectedCategory={selectedCategory}
        categories={categories}
        snippets={snippets}
        lang={lang}
        isOpenMobile={isMobileSidebarOpen}
        onSelectSection={(sec) => setActiveSection(sec)}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar with Prominent Search & Quick Actions */}
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-zinc-200/80 bg-white px-4 dark:border-zinc-800/80 dark:bg-surface-900">
          <div className="flex flex-1 items-center gap-2.5 max-w-2xl">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label={t('header.openMenu')}
              className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 lg:hidden dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                aria-hidden="true"
              />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeSection === 'settings') {
                    setActiveSection('all');
                  }
                }}
                placeholder={t('header.searchPlaceholder')}
                aria-label={t('header.searchPlaceholder')}
                className="w-full rounded-md border border-zinc-200 bg-zinc-100/70 py-1.5 pl-9 pr-8 text-sm text-zinc-900 placeholder-zinc-500 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-surface-950 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-indigo-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label={t('header.clearSearch')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Quick Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              title={t('header.commandPalette')}
              aria-label={t('header.commandPalette')}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-surface-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <Command className="h-3.5 w-3.5" />
              <span className="font-mono text-[11px]">Ctrl+K</span>
            </button>

            {/* Quick Language Toggle */}
            <button
              type="button"
              onClick={() =>
                void handleUpdatePreferences({
                  language: lang === 'en' ? 'tr' : 'en',
                })
              }
              aria-label={t('settings.languageLabel')}
              title={t('settings.languageLabel')}
              className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1.5 font-mono text-xs font-semibold uppercase text-zinc-700 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-surface-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {lang}
            </button>

            {/* Quick Theme Toggle */}
            <button
              type="button"
              onClick={handleToggleQuickTheme}
              aria-label={t('palette.actionToggleTheme')}
              title={t('palette.actionToggleTheme')}
              className="rounded-md border border-zinc-200 bg-zinc-50 p-1.5 text-zinc-600 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-surface-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {preferences.theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </button>

            {/* Primary Quick-Create Button */}
            <button
              type="button"
              onClick={() => {
                setEditingSnippet(null);
                setIsEditorOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-2xs hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t('header.newSnippet')}</span>
              <span className="sm:hidden">{t('header.newSnippetShort')}</span>
            </button>
          </div>
        </header>

        {/* Storage Error Alert if IndexedDB is blocked */}
        {storageError && (
          <div className="border-b border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-700 dark:text-red-300">
            {storageError}
          </div>
        )}

        {/* Main Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
              Loading local library...
            </div>
          ) : activeSection === 'settings' ? (
            <SettingsView
              preferences={preferences}
              categories={categories}
              onUpdatePreferences={handleUpdatePreferences}
              onExportBackup={handleExportFullBackup}
              onExecuteImport={handleExecuteImportBundle}
              onImportPlainTextFile={handleImportPlainTextFile}
              onLoadSampleData={handleLoadSampleSnippets}
              onRequestClearAllData={handleRequestClearAllData}
            />
          ) : (
            <div className="mx-auto max-w-6xl space-y-5">
              {/* Contextual Heading & Section Toolbar */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {t(`nav.${activeSection}`)}
                  </h1>
                  {selectedCategory !== 'ALL' && activeSection !== 'trash' && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                      <span>{getCategoryDisplayName(selectedCategory)}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedCategory('ALL')}
                        aria-label="Clear category filter"
                        className="hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  <span className="rounded bg-zinc-200/70 px-2 py-0.5 font-mono text-xs text-zinc-600 dark:bg-surface-800 dark:text-zinc-400">
                    {t('filter.showingCount', { count: displayedSnippets.length })}
                  </span>
                </div>

                {/* Trash Header Action or Filter Controls */}
                {activeSection === 'trash' ? (
                  trashedCount > 0 && (
                    <button
                      type="button"
                      onClick={handleRequestEmptyTrash}
                      className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{t('action.emptyTrash')}</span>
                    </button>
                  )
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Category Filter */}
                    <select
                      aria-label={t('filter.category')}
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-700 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-surface-900 dark:text-zinc-300"
                    >
                      <option value="ALL">{t('nav.allCategories')}</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {getCategoryDisplayName(c.name)}
                        </option>
                      ))}
                    </select>

                    {/* Type Filter */}
                    <select
                      aria-label={t('filter.type')}
                      value={selectedType}
                      onChange={(e) =>
                        setSelectedType(e.target.value as SnippetType | 'ALL')
                      }
                      className="rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-700 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-surface-900 dark:text-zinc-300"
                    >
                      <option value="ALL">{t('type.all')}</option>
                      <option value="text">{t('type.text')}</option>
                      <option value="code">{t('type.code')}</option>
                      <option value="template">{t('type.template')}</option>
                      <option value="link">{t('type.link')}</option>
                    </select>

                    {/* Tag Filter */}
                    {allAvailableTags.length > 0 && (
                      <select
                        aria-label={t('filter.tag')}
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                        className="rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-700 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-surface-900 dark:text-zinc-300"
                      >
                        <option value="ALL">{t('filter.allTags')}</option>
                        {allAvailableTags.map((tag) => (
                          <option key={tag} value={tag}>
                            #{tag}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Favorites Toggle */}
                    <button
                      type="button"
                      onClick={() => setOnlyFavorites((prev) => !prev)}
                      aria-pressed={onlyFavorites}
                      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        onlyFavorites
                          ? 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                          : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-surface-900 dark:text-zinc-300'
                      }`}
                    >
                      <Star
                        className="h-3.5 w-3.5"
                        fill={onlyFavorites ? 'currentColor' : 'none'}
                      />
                      <span className="hidden md:inline">{t('filter.favoritesOnly')}</span>
                    </button>

                    {/* Sort Field & Direction */}
                    <div className="flex items-center rounded-md border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-surface-900">
                      <select
                        aria-label={t('filter.sortBy')}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortField)}
                        className="rounded-l-md bg-transparent px-2.5 py-1.5 text-xs text-zinc-700 focus:outline-none dark:text-zinc-300"
                      >
                        <option value="updatedAt">{t('filter.sort.updatedAt')}</option>
                        <option value="createdAt">{t('filter.sort.createdAt')}</option>
                        <option value="title">{t('filter.sort.title')}</option>
                        <option value="usageCount">{t('filter.sort.usageCount')}</option>
                      </select>
                      <button
                        type="button"
                        onClick={() =>
                          setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
                        }
                        aria-label={
                          sortDirection === 'asc'
                            ? t('filter.sortAsc')
                            : t('filter.sortDesc')
                        }
                        title={
                          sortDirection === 'asc'
                            ? t('filter.sortAsc')
                            : t('filter.sortDesc')
                        }
                        className="border-l border-zinc-200 px-2 py-1.5 text-zinc-500 hover:text-zinc-800 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                      >
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Layout Toggle (Cards vs List) */}
                    <div className="flex items-center rounded-md border border-zinc-200 bg-white p-0.5 dark:border-zinc-800 dark:bg-surface-900">
                      <button
                        type="button"
                        onClick={() =>
                          void handleUpdatePreferences({ layoutMode: 'cards' })
                        }
                        aria-label={t('filter.layoutCards')}
                        title={t('filter.layoutCards')}
                        className={`rounded p-1 ${
                          preferences.layoutMode === 'cards'
                            ? 'bg-zinc-200 text-zinc-900 dark:bg-surface-800 dark:text-zinc-100'
                            : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                        }`}
                      >
                        <LayoutGrid className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          void handleUpdatePreferences({ layoutMode: 'list' })
                        }
                        aria-label={t('filter.layoutList')}
                        title={t('filter.layoutList')}
                        className={`rounded p-1 ${
                          preferences.layoutMode === 'list'
                            ? 'bg-zinc-200 text-zinc-900 dark:bg-surface-800 dark:text-zinc-100'
                            : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                        }`}
                      >
                        <List className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={resetAllFilters}
                        className="inline-flex items-center gap-1 rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-surface-800 dark:text-zinc-300"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>{t('filter.resetAll')}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Introduction / Onboarding Guide Banner */}
              {!preferences.dismissedOnboarding && activeSection !== 'trash' && (
                <section
                  aria-label={t('onboarding.title')}
                  className="rounded-lg border border-zinc-200 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-surface-900"
                >
                  <div className="flex items-center justify-between pb-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-indigo-500" />
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                        {t('onboarding.title')}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        void handleUpdatePreferences({ dismissedOnboarding: true })
                      }
                      className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    >
                      {t('onboarding.dismiss')}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-md bg-zinc-50 p-3 dark:bg-surface-950">
                      <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {t('onboarding.stepSearchTitle')}
                      </h3>
                      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                        {t('onboarding.stepSearchDesc')}
                      </p>
                    </div>
                    <div className="rounded-md bg-zinc-50 p-3 dark:bg-surface-950">
                      <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {t('onboarding.stepCopyTitle')}
                      </h3>
                      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                        {t('onboarding.stepCopyDesc')}
                      </p>
                    </div>
                    <div className="rounded-md bg-zinc-50 p-3 dark:bg-surface-950">
                      <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {t('onboarding.stepTemplateTitle')}
                      </h3>
                      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                        {t('onboarding.stepTemplateDesc')}
                      </p>
                    </div>
                    <div className="rounded-md bg-zinc-50 p-3 dark:bg-surface-950">
                      <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {t('onboarding.stepPrivacyTitle')}
                      </h3>
                      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                        {t('onboarding.stepPrivacyDesc')}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* Snippet List or Empty States */}
              {displayedSnippets.length > 0 ? (
                <div
                  className={
                    preferences.layoutMode === 'cards'
                      ? 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'
                      : 'space-y-2.5'
                  }
                >
                  {displayedSnippets.map((snippet) => (
                    <SnippetCard
                      key={snippet.id}
                      snippet={snippet}
                      layoutMode={preferences.layoutMode}
                      lang={lang}
                      onCopy={handleCopySnippet}
                      onOpenDetailOrTemplate={(s) => setWorkbenchSnippet(s)}
                      onEdit={(s) => {
                        setEditingSnippet(s);
                        setIsEditorOpen(true);
                      }}
                      onDuplicate={(s) => void handleDuplicateSnippet(s)}
                      onToggleFavorite={(s) => void handleToggleFavorite(s)}
                      onMoveToTrash={(s) => void handleMoveToTrash(s)}
                      onRestore={(s) => void handleRestoreFromTrash(s)}
                      onDeletePermanently={handleRequestPermanentDelete}
                      onExportIndividualFile={(s) =>
                        handleExportIndividualSnippet(s, 'auto')
                      }
                      onClickTag={(tag) => setSelectedTag(tag)}
                      onClickCategory={(cat) => setSelectedCategory(cat)}
                    />
                  ))}
                </div>
              ) : activeNonTrashedCount === 0 && activeSection !== 'trash' ? (
                /* Empty Library Onboarding State with the 2 required initial actions */
                <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-14 text-center dark:border-zinc-800 dark:bg-surface-900">
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {t('empty.libraryTitle')}
                  </h2>
                  <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {t('empty.librarySubtitle')}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSnippet(null);
                        setIsEditorOpen(true);
                      }}
                      className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <Plus className="h-4 w-4" />
                      <span>{t('empty.createFirst')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleLoadSampleSnippets()}
                      className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-surface-800 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span>{t('empty.loadSamples')}</span>
                    </button>
                  </div>
                </div>
              ) : hasActiveFilters ? (
                /* Empty Search / Filter Results State */
                <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-12 text-center dark:border-zinc-800 dark:bg-surface-900">
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {t('empty.noSearchMatchTitle')}
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {t('empty.noSearchMatchSubtitle')}
                  </p>
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>{t('filter.resetAll')}</span>
                  </button>
                </div>
              ) : (
                /* Section-specific Empty State (Trash, Favorites, Recently Used, etc.) */
                <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-12 text-center dark:border-zinc-800 dark:bg-surface-900">
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {activeSection === 'trash'
                      ? t('empty.trashTitle')
                      : activeSection === 'favorites'
                      ? t('empty.favoritesTitle')
                      : activeSection === 'recent'
                      ? t('empty.recentTitle')
                      : t('empty.sectionTitle')}
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {activeSection === 'trash'
                      ? t('empty.trashSubtitle')
                      : activeSection === 'favorites'
                      ? t('empty.favoritesSubtitle')
                      : activeSection === 'recent'
                      ? t('empty.recentSubtitle')
                      : t('empty.sectionSubtitle')}
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Create / Edit Snippet Modal */}
      <SnippetEditorModal
        isOpen={isEditorOpen}
        editingSnippet={editingSnippet}
        categories={categories}
        defaultCategory={
          selectedCategory !== 'ALL' ? selectedCategory : preferences.defaultCategory
        }
        initialType={initialEditorType}
        lang={lang}
        onSave={handleSaveSnippet}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingSnippet(null);
        }}
      />

      {/* Dynamic Template Workbench & Snippet Detail Modal */}
      <TemplateWorkbenchModal
        snippet={workbenchSnippet}
        lang={lang}
        onClose={() => setWorkbenchSnippet(null)}
        onCopyText={handleCopyCustomText}
        onEdit={(s) => {
          setEditingSnippet(s);
          setIsEditorOpen(true);
        }}
        onDuplicate={(s) => void handleDuplicateSnippet(s)}
        onExportFile={handleExportIndividualSnippet}
      />

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        categories={categories}
        snippets={snippets}
        lang={lang}
        onCreateCategory={handleCreateCategory}
        onRenameCategory={handleRenameCategory}
        onDeleteCategory={handleDeleteCategory}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      {/* Command Palette Modal (Ctrl/Cmd + K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        snippets={snippets}
        lang={lang}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenSnippet={(s) => setWorkbenchSnippet(s)}
        onCopySnippet={handleCopySnippet}
        onCreateSnippet={() => {
          setEditingSnippet(null);
          setIsEditorOpen(true);
        }}
        onNavigate={(sec) => setActiveSection(sec)}
        onToggleTheme={handleToggleQuickTheme}
        onExportBackup={() => void handleExportFullBackup()}
      />

      {/* Destructive Action Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(confirmState?.isOpen)}
        title={confirmState?.title || ''}
        description={confirmState?.description || ''}
        confirmLabel={t('action.confirm')}
        cancelLabel={t('action.cancel')}
        onConfirm={() => {
          if (confirmState?.onConfirm) {
            void confirmState.onConfirm();
          }
        }}
        onCancel={() => setConfirmState(null)}
      />

      {/* Toast Notification Banner */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-medium shadow-lg transition-all ${
            toast.type === 'error'
              ? 'border-red-500/40 bg-red-950 text-red-200'
              : 'border-zinc-700 bg-zinc-900 text-zinc-100'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="h-4 w-4 text-red-400" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          )}
          <span>{toast.text}</span>
        </div>
      )}
    </div>
  );
};

export default App;
