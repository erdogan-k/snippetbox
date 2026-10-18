import React, { useRef, useState } from 'react';
import {
  Download,
  Upload,
  FileUp,
  Trash2,
  ShieldAlert,
  Database,
  Sliders,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  AppPreferences,
  CategoryItem,
  InterfaceLanguage,
  LayoutMode,
  NavSection,
  Snippet,
  ThemeMode,
} from '../types/snippet';
import { translate } from '../i18n/translations';
import {
  ImportValidationResult,
  validateAndMigrateImportBundle,
} from '../utils/validation';

interface SettingsViewProps {
  preferences: AppPreferences;
  categories: CategoryItem[];
  onUpdatePreferences: (partial: Partial<AppPreferences>) => Promise<void>;
  onExportBackup: () => Promise<void>;
  onExecuteImport: (
    snippets: Snippet[],
    categories: CategoryItem[],
    mode: 'merge' | 'replace'
  ) => Promise<{
    importedCount: number;
    updatedOrMergedCount: number;
    reassignedDuplicateIds: number;
  }>;
  onImportPlainTextFile: (filename: string, content: string) => Promise<void>;
  onLoadSampleData: () => Promise<void>;
  onRequestClearAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  preferences,
  categories,
  onUpdatePreferences,
  onExportBackup,
  onExecuteImport,
  onImportPlainTextFile,
  onLoadSampleData,
  onRequestClearAllData,
}) => {
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const textFileInputRef = useRef<HTMLInputElement>(null);

  const [importPreview, setImportPreview] = useState<ImportValidationResult | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const lang = preferences.language;
  const t = (key: string, params?: Record<string, string | number>) =>
    translate(lang, key, params);

  const getCategoryDisplayName = (catName: string) => {
    const key = `cat.${catName}`;
    const localized = t(key);
    return localized !== key ? localized : catName;
  };

  const handleJsonFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (jsonInputRef.current) jsonInputRef.current.value = '';
    if (!file) return;

    setImportError(null);
    setImportSuccess(null);
    setImportPreview(null);

    try {
      const text = await file.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        setImportError(t('import.errorInvalidJsonStructure'));
        return;
      }

      const validation = validateAndMigrateImportBundle(parsed);
      if (!validation.isValid) {
        setImportError(
          t(validation.errorKey || 'import.errorInvalidJsonStructure', {
            detail: validation.errorDetail || '',
          })
        );
        return;
      }

      setImportPreview(validation);
      setImportMode('merge');
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : t('import.errorInvalidJsonStructure')
      );
    }
  };

  const handleConfirmImport = async () => {
    if (!importPreview || !importPreview.isValid) return;
    const res = await onExecuteImport(
      importPreview.validSnippets,
      importPreview.categories,
      importMode
    );
    setImportPreview(null);
    setImportSuccess(
      t('import.successSummary', {
        imported: res.importedCount,
        merged: res.updatedOrMergedCount,
        reassigned: res.reassignedDuplicateIds,
      })
    );
  };

  const handlePlainTextFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (textFileInputRef.current) textFileInputRef.current.value = '';
    if (!file) return;

    const content = await file.text();
    if (!content.trim()) return;
    await onImportPlainTextFile(file.name, content);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          {t('settings.title')}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* 1. Appearance & Localization */}
      <section className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-surface-900">
        <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
          <Sliders className="h-4 w-4 text-indigo-500" />
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {t('settings.appearanceHeading')}
          </h2>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Theme Mode */}
          <div>
            <label
              htmlFor="pref-theme"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
            >
              {t('settings.themeLabel')}
            </label>
            <select
              id="pref-theme"
              value={preferences.theme}
              onChange={(e) =>
                void onUpdatePreferences({ theme: e.target.value as ThemeMode })
              }
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-surface-950 dark:text-zinc-100"
            >
              <option value="dark">{t('settings.themeDark')}</option>
              <option value="light">{t('settings.themeLight')}</option>
              <option value="system">{t('settings.themeSystem')}</option>
            </select>
          </div>

          {/* Interface Language */}
          <div>
            <label
              htmlFor="pref-language"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
            >
              {t('settings.languageLabel')}
            </label>
            <select
              id="pref-language"
              value={preferences.language}
              onChange={(e) =>
                void onUpdatePreferences({
                  language: e.target.value as InterfaceLanguage,
                })
              }
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-surface-950 dark:text-zinc-100"
            >
              <option value="en">{t('settings.langEn')}</option>
              <option value="tr">{t('settings.langTr')}</option>
            </select>
          </div>

          {/* Default View */}
          <div>
            <label
              htmlFor="pref-default-view"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
            >
              {t('settings.defaultViewLabel')}
            </label>
            <select
              id="pref-default-view"
              value={preferences.defaultView}
              onChange={(e) =>
                void onUpdatePreferences({
                  defaultView: e.target.value as Exclude<NavSection, 'settings' | 'trash'>,
                })
              }
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-surface-950 dark:text-zinc-100"
            >
              <option value="all">{t('nav.all')}</option>
              <option value="favorites">{t('nav.favorites')}</option>
              <option value="templates">{t('nav.templates')}</option>
              <option value="code">{t('nav.code')}</option>
              <option value="text">{t('nav.text')}</option>
              <option value="recent">{t('nav.recent')}</option>
            </select>
          </div>

          {/* Layout Mode */}
          <div>
            <label
              htmlFor="pref-layout"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
            >
              {t('settings.layoutModeLabel')}
            </label>
            <select
              id="pref-layout"
              value={preferences.layoutMode}
              onChange={(e) =>
                void onUpdatePreferences({ layoutMode: e.target.value as LayoutMode })
              }
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-surface-950 dark:text-zinc-100"
            >
              <option value="cards">{t('settings.layoutCards')}</option>
              <option value="list">{t('settings.layoutList')}</option>
            </select>
          </div>

          {/* Default Category */}
          <div>
            <label
              htmlFor="pref-default-category"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
            >
              {t('settings.defaultCategoryLabel')}
            </label>
            <select
              id="pref-default-category"
              value={preferences.defaultCategory}
              onChange={(e) =>
                void onUpdatePreferences({ defaultCategory: e.target.value })
              }
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-surface-950 dark:text-zinc-100"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {getCategoryDisplayName(cat.name)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* 2. Local Backup: Import & Export */}
      <section className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-surface-900">
        <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
          <Database className="h-4 w-4 text-indigo-500" />
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {t('settings.backupHeading')}
          </h2>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
          {t('settings.backupDesc')}
        </p>

        <div className="mt-4 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => void onExportBackup()}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Download className="h-4 w-4" />
            <span>{t('settings.exportJsonBtn')}</span>
          </button>

          <button
            type="button"
            onClick={() => jsonInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-surface-800 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <Upload className="h-4 w-4" />
            <span>{t('settings.importJsonBtn')}</span>
          </button>
          <input
            ref={jsonInputRef}
            type="file"
            accept=".json,application/json"
            onChange={(e) => void handleJsonFileChange(e)}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => textFileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-surface-800 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <FileUp className="h-4 w-4" />
            <span>{t('settings.importTxtBtn')}</span>
          </button>
          <input
            ref={textFileInputRef}
            type="file"
            accept=".txt,.md,.ts,.tsx,.js,.jsx,.py,.sh,.ps1,.sql,.json,.yaml,.yml,.go,.rs,.java,.cs,.html,.css"
            onChange={(e) => void handlePlainTextFileChange(e)}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => void onLoadSampleData()}
            className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-surface-800 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>{t('settings.loadDemoBtn')}</span>
          </button>
        </div>

        {importError && (
          <div className="mt-4 flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{importError}</span>
          </div>
        )}

        {importSuccess && (
          <div className="mt-4 flex items-start gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{importSuccess}</span>
          </div>
        )}

        {/* Import Preview & Mode Selection Panel */}
        {importPreview && (
          <div className="mt-4 rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {t('import.previewTitle')}
              </h3>
              <span className="rounded bg-indigo-500/15 px-2 py-0.5 font-mono text-xs text-indigo-700 dark:text-indigo-300">
                {t('import.schemaVersion', { version: importPreview.schemaVersion ?? 1 })}
              </span>
            </div>

            <p className="text-xs text-zinc-700 dark:text-zinc-300">
              {t('import.itemsDetected', {
                count: importPreview.validSnippets.length,
                catCount: importPreview.categories.length,
              })}
            </p>

            <div className="space-y-2">
              <span className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {t('import.modeLabel')}
              </span>
              <label className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="radio"
                  name="import-mode"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="mt-0.5"
                />
                <span>{t('import.modeMerge')}</span>
              </label>
              <label className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="radio"
                  name="import-mode"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="mt-0.5"
                />
                <span>{t('import.modeReplace')}</span>
              </label>
            </div>

            {importMode === 'replace' && (
              <p className="rounded border border-red-500/30 bg-red-500/10 p-2 text-xs font-medium text-red-600 dark:text-red-400">
                {t('import.replaceWarning')}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setImportPreview(null)}
                className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-surface-800 dark:text-zinc-200"
              >
                {t('action.cancel')}
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmImport()}
                className={`rounded-md px-3.5 py-1.5 text-xs font-medium text-white ${
                  importMode === 'replace'
                    ? 'bg-red-600 hover:bg-red-500'
                    : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
              >
                {t('import.confirmButton')}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 3. Privacy & Security Explanation */}
      <section className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-surface-900">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {t('settings.privacyHeading')}
            </h2>
          </div>
          <span className="font-mono text-xs text-zinc-500">
            {t('settings.versionLabel')}: v1.0.0
          </span>
        </div>

        <div className="mt-3 space-y-2.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
          <p>{t('settings.privacyParagraph1')}</p>
          <p>{t('settings.privacyParagraph2')}</p>
          <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-amber-800 dark:text-amber-300">
            {t('settings.privacySecurityNotice')}
          </div>
        </div>
      </section>

      {/* 4. Danger Zone */}
      <section className="rounded-lg border border-red-500/30 bg-red-500/5 p-5">
        <h2 className="text-sm font-semibold text-red-700 dark:text-red-400">
          {t('settings.dangerHeading')}
        </h2>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          {t('settings.clearAllDesc')}
        </p>
        <button
          type="button"
          onClick={onRequestClearAllData}
          className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <Trash2 className="h-4 w-4" />
          <span>{t('settings.clearAllBtn')}</span>
        </button>
      </section>
    </div>
  );
};
