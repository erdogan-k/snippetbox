import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Braces,
  Edit3,
  Files,
  Download,
  RotateCcw,
  AlignLeft,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { InterfaceLanguage, Snippet } from '../types/snippet';
import { formatRelativeTime, translate } from '../i18n/translations';
import { parseTemplateVariables, renderTemplate } from '../utils/templateEngine';

interface TemplateWorkbenchModalProps {
  snippet: Snippet | null;
  lang: InterfaceLanguage;
  onClose: () => void;
  onCopyText: (text: string, snippetId: string, isRenderedTemplate: boolean) => Promise<boolean>;
  onEdit: (snippet: Snippet) => void;
  onDuplicate: (snippet: Snippet) => void;
  onExportFile: (snippet: Snippet, format: 'auto' | 'md') => void;
}

export const TemplateWorkbenchModal: React.FC<TemplateWorkbenchModalProps> = ({
  snippet,
  lang,
  onClose,
  onCopyText,
  onEdit,
  onDuplicate,
  onExportFile,
}) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [multilineMap, setMultilineMap] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'rendered' | 'raw'>('rendered');
  const [copiedRendered, setCopiedRendered] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);

  const t = (key: string, params?: Record<string, string | number>) =>
    translate(lang, key, params);

  useEffect(() => {
    if (!snippet) return;
    const parsed = parseTemplateVariables(snippet.content);
    const initial: Record<string, string> = {};
    for (const v of parsed.variables) {
      initial[v] = '';
    }
    setValues(initial);
    setMultilineMap({});
    setActiveTab('rendered');
    setCopiedRendered(false);
    setCopiedRaw(false);
  }, [snippet]);

  useEffect(() => {
    if (!snippet) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [snippet, onClose]);

  if (!snippet) return null;

  const parsed = parseTemplateVariables(snippet.content);
  const hasVariables = parsed.variables.length > 0;
  const renderOutput = renderTemplate(snippet.content, values, {
    preserveMissingPlaceholder: true,
  });

  const handleCopyRendered = async () => {
    const textToCopy = hasVariables ? renderOutput.rendered : snippet.content;
    const ok = await onCopyText(textToCopy, snippet.id, hasVariables);
    if (ok) {
      setCopiedRendered(true);
      setTimeout(() => setCopiedRendered(false), 1800);
    }
  };

  const handleCopyRaw = async () => {
    const ok = await onCopyText(snippet.content, snippet.id, false);
    if (ok) {
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 1800);
    }
  };

  const resetValues = () => {
    const cleared: Record<string, string> = {};
    for (const v of parsed.variables) {
      cleared[v] = '';
    }
    setValues(cleared);
  };

  const getCategoryDisplayName = (catName: string) => {
    const key = `cat.${catName}`;
    const localized = t(key);
    return localized !== key ? localized : catName;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="workbench-modal-title"
    >
      <div className="my-auto flex max-h-[92vh] w-full max-w-4xl flex-col rounded-lg border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-surface-900">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-300">
                <Braces className="h-3.5 w-3.5" />
                {hasVariables ? t('template.workbenchTitle') : t('snippet.detailView')}
              </span>
              <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-surface-800 dark:text-zinc-400">
                {getCategoryDisplayName(snippet.category)}
              </span>
              {snippet.language && (
                <span className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-xs text-zinc-600 dark:bg-surface-800 dark:text-zinc-400">
                  {snippet.language}
                </span>
              )}
            </div>
            <h2
              id="workbench-modal-title"
              className="mt-1.5 text-lg font-semibold text-zinc-900 dark:text-zinc-100"
            >
              {snippet.title}
            </h2>
            {snippet.description && (
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                {snippet.description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('action.close')}
            className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {hasVariables ? (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              {/* Left Column: Auto-generated Variable Inputs */}
              <div className="space-y-3 lg:col-span-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    {t('template.variablesHeading')} ({parsed.variables.length})
                  </h3>
                  <button
                    type="button"
                    onClick={resetValues}
                    className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>{t('template.clearValues')}</span>
                  </button>
                </div>

                <div className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-surface-950/60">
                  {parsed.variables.map((varName, idx) => {
                    const isMultiline = Boolean(multilineMap[varName]);
                    const inputId = `tpl-var-${varName}`;
                    return (
                      <div key={varName}>
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor={inputId}
                            className="font-mono text-xs font-medium text-zinc-800 dark:text-zinc-200"
                          >
                            {`{{${varName}}}`}
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setMultilineMap((prev) => ({
                                ...prev,
                                [varName]: !prev[varName],
                              }))
                            }
                            title={t('template.multilineToggle')}
                            aria-label={t('template.multilineToggle')}
                            className={`rounded p-1 text-xs ${
                              isMultiline
                                ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300'
                                : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                            }`}
                          >
                            <AlignLeft className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {isMultiline ? (
                          <textarea
                            id={inputId}
                            rows={3}
                            autoFocus={idx === 0}
                            value={values[varName] ?? ''}
                            onChange={(e) =>
                              setValues((prev) => ({ ...prev, [varName]: e.target.value }))
                            }
                            placeholder={t('template.enterValueFor', { name: varName })}
                            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-surface-900 dark:text-zinc-100"
                          />
                        ) : (
                          <input
                            id={inputId}
                            type="text"
                            autoFocus={idx === 0}
                            value={values[varName] ?? ''}
                            onChange={(e) =>
                              setValues((prev) => ({ ...prev, [varName]: e.target.value }))
                            }
                            placeholder={t('template.enterValueFor', { name: varName })}
                            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-surface-900 dark:text-zinc-100"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Missing variable status indicator */}
                {renderOutput.missingVariables.length > 0 ? (
                  <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-800 dark:text-amber-300">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      {t('template.missingWarning', {
                        vars: renderOutput.missingVariables.join(', '),
                      })}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{t('template.allFilled')}</span>
                  </div>
                )}
              </div>

              {/* Right Column: Live Rendered Output vs Original Template */}
              <div className="flex flex-col lg:col-span-7">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2 dark:border-zinc-800">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('rendered')}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                        activeTab === 'rendered'
                          ? 'bg-indigo-600 text-white'
                          : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {t('template.livePreview')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('raw')}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                        activeTab === 'raw'
                          ? 'bg-indigo-600 text-white'
                          : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {t('template.rawSource')}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyRaw}
                    className="inline-flex items-center gap-1 rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    {copiedRaw ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{t('action.copied')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>{t('action.copyRawTemplate')}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-3 flex-1 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-surface-950">
                  <pre className="max-h-80 overflow-y-auto font-mono text-xs leading-relaxed text-zinc-900 whitespace-pre-wrap break-words dark:text-zinc-100">
                    {activeTab === 'rendered' ? renderOutput.rendered : snippet.content}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            /* Standard Snippet Detail View (Code / Text / Link without variables) */
            <div className="space-y-4">
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-surface-950">
                <pre className="max-h-96 overflow-y-auto font-mono text-xs leading-relaxed text-zinc-900 whitespace-pre-wrap break-words dark:text-zinc-100">
                  {snippet.content}
                </pre>
              </div>

              {snippet.sourceUrl && (
                <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <span className="font-medium">{t('editor.fieldSourceUrl')}:</span>
                  <a
                    href={snippet.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    <span>{snippet.sourceUrl}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Metadata Footer inside body */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-3 text-xs text-zinc-500 dark:border-zinc-800/80">
            <div className="flex flex-wrap items-center gap-3">
              <span>{t('snippet.usedCount', { count: snippet.usageCount })}</span>
              <span>•</span>
              <span>
                {t('snippet.updated', {
                  time: formatRelativeTime(snippet.updatedAt, lang),
                })}
              </span>
              {snippet.tags.length > 0 && (
                <>
                  <span>•</span>
                  <div className="flex flex-wrap gap-1">
                    {snippet.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-zinc-100 px-1.5 py-0.5 text-[11px] text-zinc-600 dark:bg-surface-800 dark:text-zinc-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200 px-5 py-3.5 dark:border-zinc-800">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(snippet);
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-surface-800 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>{t('action.edit')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onDuplicate(snippet);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-surface-800 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <Files className="h-3.5 w-3.5" />
              <span>{t('action.duplicate')}</span>
            </button>
            <button
              type="button"
              onClick={() => onExportFile(snippet, 'auto')}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-surface-800 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{t('action.exportTxt')}</span>
            </button>
            <button
              type="button"
              onClick={() => onExportFile(snippet, 'md')}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-surface-800 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{t('action.exportMd')}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyRendered}
            className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              copiedRendered
                ? 'bg-emerald-600'
                : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
          >
            {copiedRendered ? (
              <>
                <Check className="h-4 w-4" />
                <span>{t('action.copied')}</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>
                  {hasVariables ? t('action.copyRendered') : t('action.copy')}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
