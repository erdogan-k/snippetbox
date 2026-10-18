import React, { useState } from 'react';
import {
  Copy,
  Check,
  Star,
  Edit3,
  Files,
  Trash2,
  RotateCcw,
  Braces,
  Code2,
  FileText,
  Link2,
  ExternalLink,
  Download,
  Tag,
} from 'lucide-react';
import { InterfaceLanguage, LayoutMode, Snippet } from '../types/snippet';
import { formatRelativeTime, translate } from '../i18n/translations';
import { parseTemplateVariables } from '../utils/templateEngine';

interface SnippetCardProps {
  snippet: Snippet;
  layoutMode: LayoutMode;
  lang: InterfaceLanguage;
  onCopy: (snippet: Snippet) => Promise<boolean>;
  onOpenDetailOrTemplate: (snippet: Snippet) => void;
  onEdit: (snippet: Snippet) => void;
  onDuplicate: (snippet: Snippet) => void;
  onToggleFavorite: (snippet: Snippet) => void;
  onMoveToTrash: (snippet: Snippet) => void;
  onRestore: (snippet: Snippet) => void;
  onDeletePermanently: (snippet: Snippet) => void;
  onExportIndividualFile: (snippet: Snippet) => void;
  onClickTag: (tag: string) => void;
  onClickCategory: (category: string) => void;
}

export const SnippetCard: React.FC<SnippetCardProps> = ({
  snippet,
  layoutMode,
  lang,
  onCopy,
  onOpenDetailOrTemplate,
  onEdit,
  onDuplicate,
  onToggleFavorite,
  onMoveToTrash,
  onRestore,
  onDeletePermanently,
  onExportIndividualFile,
  onClickTag,
  onClickCategory,
}) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const t = (key: string, params?: Record<string, string | number>) =>
    translate(lang, key, params);

  const isTrashed = snippet.status === 'trashed';
  const parsedVars =
    snippet.type === 'template' ? parseTemplateVariables(snippet.content) : null;
  const hasTemplateVariables = (parsedVars?.variables.length ?? 0) > 0;

  const handleCopyClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await onCopy(snippet);
    setCopyStatus(ok ? 'copied' : 'error');
    setTimeout(() => setCopyStatus('idle'), 1800);
  };

  const getCategoryDisplayName = (catName: string) => {
    const key = `cat.${catName}`;
    const localized = t(key);
    return localized !== key ? localized : catName;
  };

  const TypeIcon =
    snippet.type === 'code'
      ? Code2
      : snippet.type === 'template'
      ? Braces
      : snippet.type === 'link'
      ? Link2
      : FileText;

  const typeBadgeStyles =
    snippet.type === 'code'
      ? 'bg-sky-500/10 text-sky-700 border-sky-500/20 dark:text-sky-300'
      : snippet.type === 'template'
      ? 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300'
      : snippet.type === 'link'
      ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300'
      : 'bg-zinc-500/10 text-zinc-700 border-zinc-500/20 dark:text-zinc-300';

  if (layoutMode === 'list') {
    return (
      <article
        onClick={() => onOpenDetailOrTemplate(snippet)}
        className="group flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-3 transition-colors hover:border-zinc-300 sm:flex-row sm:items-center sm:justify-between cursor-pointer dark:border-zinc-800 dark:bg-surface-900 dark:hover:border-zinc-700"
      >
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-medium ${typeBadgeStyles}`}
            >
              <TypeIcon className="h-3 w-3" />
              {snippet.type === 'code' && snippet.language
                ? snippet.language
                : t(`type.${snippet.type}`)}
            </span>
            <h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {snippet.title}
            </h3>
            {snippet.isDemo && (
              <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
                {t('snippet.demoBadge')}
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClickCategory(snippet.category);
              }}
              className="rounded bg-zinc-100 px-1.5 py-0.5 text-[11px] text-zinc-600 hover:bg-zinc-200 dark:bg-surface-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              {getCategoryDisplayName(snippet.category)}
            </button>
          </div>
          <p className="truncate font-mono text-xs text-zinc-500 dark:text-zinc-400">
            {snippet.content.replace(/\s+/g, ' ').slice(0, 140)}
          </p>
        </div>

        {/* Right actions */}
        <div
          className="flex shrink-0 items-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {!isTrashed && snippet.type === 'template' && hasTemplateVariables && (
            <button
              type="button"
              onClick={() => onOpenDetailOrTemplate(snippet)}
              className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-500/20 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-amber-300"
            >
              <Braces className="h-3.5 w-3.5" />
              <span>{t('action.useTemplate')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyClick}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              copyStatus === 'copied'
                ? 'bg-emerald-600 text-white'
                : copyStatus === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-indigo-600 text-white hover:bg-indigo-500'
            }`}
          >
            {copyStatus === 'copied' ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>{t('action.copied')}</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>{t('action.copy')}</span>
              </>
            )}
          </button>

          {!isTrashed ? (
            <>
              <button
                type="button"
                onClick={() => onToggleFavorite(snippet)}
                aria-label={t('action.favorite')}
                title={t('action.favorite')}
                className={`rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  snippet.isFavorite
                    ? 'text-amber-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <Star
                  className="h-4 w-4"
                  fill={snippet.isFavorite ? 'currentColor' : 'none'}
                />
              </button>
              <button
                type="button"
                onClick={() => onEdit(snippet)}
                aria-label={t('action.edit')}
                title={t('action.edit')}
                className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onMoveToTrash(snippet)}
                aria-label={t('action.moveToTrash')}
                title={t('action.moveToTrash')}
                className="rounded-md p-1.5 text-zinc-400 hover:bg-red-500/10 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onRestore(snippet)}
                aria-label={t('action.restore')}
                title={t('action.restore')}
                className="inline-flex items-center gap-1 rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{t('action.restore')}</span>
              </button>
              <button
                type="button"
                onClick={() => onDeletePermanently(snippet)}
                aria-label={t('action.deletePermanently')}
                title={t('action.deletePermanently')}
                className="inline-flex items-center gap-1 rounded-md bg-red-600/10 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-600/20 dark:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{t('action.deletePermanently')}</span>
              </button>
            </>
          )}
        </div>
      </article>
    );
  }

  // Default Card Grid View
  return (
    <article
      onClick={() => onOpenDetailOrTemplate(snippet)}
      className="group flex flex-col justify-between rounded-lg border border-zinc-200/90 bg-white p-4 shadow-2xs transition-colors hover:border-zinc-300 cursor-pointer dark:border-zinc-800/90 dark:bg-surface-900 dark:hover:border-zinc-700"
    >
      <div>
        {/* Top Row: Badges + Actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-medium ${typeBadgeStyles}`}
            >
              <TypeIcon className="h-3 w-3" />
              {snippet.type === 'code' && snippet.language
                ? snippet.language
                : t(`type.${snippet.type}`)}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClickCategory(snippet.category);
              }}
              className="rounded bg-zinc-100 px-1.5 py-0.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-200 dark:bg-surface-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              {getCategoryDisplayName(snippet.category)}
            </button>

            {snippet.isDemo && (
              <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
                {t('snippet.demoBadge')}
              </span>
            )}

            {snippet.shortcut && (
              <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 dark:border-zinc-700 dark:bg-surface-800 dark:text-zinc-400">
                {snippet.shortcut}
              </kbd>
            )}
          </div>

          {!isTrashed && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(snippet);
              }}
              aria-label={t('action.favorite')}
              title={t('action.favorite')}
              className={`rounded p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                snippet.isFavorite
                  ? 'text-amber-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Star
                className="h-4 w-4"
                fill={snippet.isFavorite ? 'currentColor' : 'none'}
              />
            </button>
          )}
        </div>

        {/* Title & Optional Description */}
        <h3 className="mt-2.5 line-clamp-1 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {snippet.title}
        </h3>
        {snippet.description && (
          <p className="mt-1 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
            {snippet.description}
          </p>
        )}

        {/* Code / Content Preview */}
        <div className="mt-3 overflow-hidden rounded-md border border-zinc-200/80 bg-zinc-50 p-2.5 dark:border-zinc-800/80 dark:bg-surface-950">
          <pre className="max-h-28 overflow-hidden font-mono text-xs leading-relaxed text-zinc-800 whitespace-pre-wrap break-words dark:text-zinc-300">
            {snippet.content.slice(0, 360)}
            {snippet.content.length > 360 ? '…' : ''}
          </pre>
        </div>

        {/* Template Variables Pill if applicable */}
        {snippet.type === 'template' && hasTemplateVariables && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
              {t('snippet.variablesDetected', {
                count: parsedVars?.variables.length ?? 0,
              })}
              :
            </span>
            {parsedVars?.variables.slice(0, 4).map((v) => (
              <span
                key={v}
                className="rounded bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] text-amber-700 dark:text-amber-300"
              >
                {`{{${v}}}`}
              </span>
            ))}
          </div>
        )}

        {/* Tags */}
        {snippet.tags.length > 0 && (
          <div
            className="mt-2.5 flex flex-wrap items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {snippet.tags.slice(0, 5).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onClickTag(tag)}
                className="inline-flex items-center gap-1 rounded bg-zinc-100 px-1.5 py-0.5 text-[11px] text-zinc-600 hover:bg-zinc-200 dark:bg-surface-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              >
                <Tag className="h-2.5 w-2.5 opacity-70" />
                <span>{tag}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer: Usage Metadata & Action Toolbar */}
      <div
        className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800/80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-500">
          <span>
            {snippet.usageCount > 0
              ? t('snippet.usedCount', { count: snippet.usageCount })
              : t('snippet.neverUsed')}
          </span>
          <span>•</span>
          <span>{formatRelativeTime(snippet.updatedAt, lang)}</span>
        </div>

        <div className="flex items-center gap-1">
          {snippet.sourceUrl && (
            <a
              href={snippet.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('action.openLink')}
              title={t('action.openLink')}
              className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}

          {!isTrashed ? (
            <>
              <button
                type="button"
                onClick={() => onEdit(snippet)}
                aria-label={t('action.edit')}
                title={t('action.edit')}
                className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDuplicate(snippet)}
                aria-label={t('action.duplicate')}
                title={t('action.duplicate')}
                className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <Files className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onExportIndividualFile(snippet)}
                aria-label={t('action.exportFile')}
                title={t('action.exportFile')}
                className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onMoveToTrash(snippet)}
                aria-label={t('action.moveToTrash')}
                title={t('action.moveToTrash')}
                className="rounded p-1.5 text-zinc-400 hover:bg-red-500/10 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>

              {snippet.type === 'template' && hasTemplateVariables && (
                <button
                  type="button"
                  onClick={() => onOpenDetailOrTemplate(snippet)}
                  className="ml-1 inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-500/20 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-amber-300"
                >
                  <Braces className="h-3.5 w-3.5" />
                  <span>{t('action.useTemplate')}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCopyClick}
                className={`ml-1 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  copyStatus === 'copied'
                    ? 'bg-emerald-600 text-white'
                    : copyStatus === 'error'
                    ? 'bg-red-600 text-white'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
              >
                {copyStatus === 'copied' ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>{t('action.copied')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>{t('action.copy')}</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onRestore(snippet)}
                className="inline-flex items-center gap-1 rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{t('action.restore')}</span>
              </button>
              <button
                type="button"
                onClick={() => onDeletePermanently(snippet)}
                className="inline-flex items-center gap-1 rounded-md bg-red-600/10 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-600/20 dark:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{t('action.deletePermanently')}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
};
