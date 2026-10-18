import React, { useState, useEffect, useRef } from 'react';
import { X, Star, Plus, Braces, AlertCircle } from 'lucide-react';
import {
  CategoryItem,
  CODE_LANGUAGES,
  InterfaceLanguage,
  Snippet,
  SnippetInput,
  SnippetType,
} from '../types/snippet';
import { translate } from '../i18n/translations';
import { validateSnippetInput, ValidationErrors } from '../utils/validation';
import { parseTemplateVariables } from '../utils/templateEngine';

interface SnippetEditorModalProps {
  isOpen: boolean;
  editingSnippet: Snippet | null;
  categories: CategoryItem[];
  defaultCategory: string;
  initialType?: SnippetType;
  lang: InterfaceLanguage;
  onSave: (input: SnippetInput, existingId?: string) => Promise<void>;
  onClose: () => void;
}

export const SnippetEditorModal: React.FC<SnippetEditorModalProps> = ({
  isOpen,
  editingSnippet,
  categories,
  defaultCategory,
  initialType = 'text',
  lang,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<SnippetType>(initialType);
  const [category, setCategory] = useState(defaultCategory);
  const [language, setLanguage] = useState('typescript');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [shortcut, setShortcut] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const t = (key: string, params?: Record<string, string | number>) =>
    translate(lang, key, params);

  useEffect(() => {
    if (!isOpen) return;
    if (editingSnippet) {
      setTitle(editingSnippet.title);
      setContent(editingSnippet.content);
      setDescription(editingSnippet.description ?? '');
      setType(editingSnippet.type);
      setCategory(editingSnippet.category);
      setLanguage(editingSnippet.language ?? 'typescript');
      setTags([...editingSnippet.tags]);
      setSourceUrl(editingSnippet.sourceUrl ?? '');
      setShortcut(editingSnippet.shortcut ?? '');
      setIsFavorite(editingSnippet.isFavorite);
    } else {
      setTitle('');
      setContent('');
      setDescription('');
      setType(initialType);
      setCategory(defaultCategory || 'General');
      setLanguage('typescript');
      setTags([]);
      setSourceUrl('');
      setShortcut('');
      setIsFavorite(false);
    }
    setTagInput('');
    setErrors({});
    setIsSubmitting(false);

    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 30);
  }, [isOpen, editingSnippet, defaultCategory, initialType]);

  const addTag = (raw: string) => {
    const cleaned = raw.trim().replace(/^,+|,+$/g, '').trim();
    if (!cleaned) return;
    if (!tags.some((existing) => existing.toLowerCase() === cleaned.toLowerCase())) {
      setTags((prev) => [...prev, cleaned.slice(0, 40)]);
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((item) => item !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  // Support Tab indentation inside code editor
  const handleContentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (type === 'code' && e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const updated = content.substring(0, start) + '  ' + content.substring(end);
      setContent(updated);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      });
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    // Include any pending tag typed in the tag box
    const finalTags = [...tags];
    if (tagInput.trim()) {
      const cleaned = tagInput.trim().replace(/^,+|,+$/g, '').trim();
      if (
        cleaned &&
        !finalTags.some((existing) => existing.toLowerCase() === cleaned.toLowerCase())
      ) {
        finalTags.push(cleaned);
      }
    }

    const candidate: SnippetInput = {
      title,
      content,
      description,
      type,
      category,
      tags: finalTags,
      isFavorite,
      language: type === 'code' ? language : undefined,
      sourceUrl,
      shortcut,
      status: editingSnippet?.status ?? 'active',
      isDemo: false,
    };

    const validation = validateSnippetInput(candidate);
    if (!validation.isValid || !validation.sanitized) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(validation.sanitized, editingSnippet?.id);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard shortcuts inside modal (Esc to close, Ctrl/Cmd + Enter to save)
  useEffect(() => {
    if (!isOpen) return;
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        void handleSubmit();
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  });

  if (!isOpen) return null;

  const parsedTemplate = parseTemplateVariables(content);
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
      aria-labelledby="snippet-editor-title"
    >
      <div className="my-auto flex max-h-[92vh] w-full max-w-2xl flex-col rounded-lg border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-surface-900">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3.5 dark:border-zinc-800">
          <h2
            id="snippet-editor-title"
            className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
          >
            {editingSnippet ? t('editor.editTitle') : t('editor.createTitle')}
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFavorite((prev) => !prev)}
              aria-label={t('editor.markFavorite')}
              title={t('editor.markFavorite')}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                isFavorite
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              <Star className="h-3.5 w-3.5" fill={isFavorite ? 'currentColor' : 'none'} />
              <span>{t('editor.markFavorite')}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('action.close')}
              className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Title */}
          <div>
            <label
              htmlFor="snippet-title-input"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
            >
              {t('editor.fieldTitle')} <span className="text-red-500">*</span>
            </label>
            <input
              ref={titleInputRef}
              id="snippet-title-input"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder={t('editor.fieldTitlePlaceholder')}
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-surface-950 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
            {errors.title && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{t(errors.title)}</span>
              </p>
            )}
          </div>

          {/* Type, Category & Optional Code Language */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label
                htmlFor="snippet-type-select"
                className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
              >
                {t('editor.fieldType')}
              </label>
              <select
                id="snippet-type-select"
                value={type}
                onChange={(e) => setType(e.target.value as SnippetType)}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2.5 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-surface-950 dark:text-zinc-100"
              >
                <option value="text">{t('type.text')}</option>
                <option value="code">{t('type.code')}</option>
                <option value="template">{t('type.template')}</option>
                <option value="link">{t('type.link')}</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="snippet-category-select"
                className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
              >
                {t('editor.fieldCategory')}
              </label>
              <select
                id="snippet-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2.5 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-surface-950 dark:text-zinc-100"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {getCategoryDisplayName(cat.name)}
                  </option>
                ))}
              </select>
            </div>

            {type === 'code' ? (
              <div>
                <label
                  htmlFor="snippet-language-select"
                  className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                >
                  {t('editor.fieldLanguage')}
                </label>
                <select
                  id="snippet-language-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2.5 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-surface-950 dark:text-zinc-100"
                >
                  {CODE_LANGUAGES.map((langItem) => (
                    <option key={langItem.value} value={langItem.value}>
                      {langItem.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="snippet-shortcut-input"
                  className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                >
                  {t('editor.fieldShortcut')}
                </label>
                <input
                  id="snippet-shortcut-input"
                  type="text"
                  value={shortcut}
                  onChange={(e) => setShortcut(e.target.value)}
                  placeholder={t('editor.fieldShortcutPlaceholder')}
                  className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-surface-950 dark:text-zinc-100"
                />
              </div>
            )}
          </div>

          {/* Content Editor */}
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="snippet-content-textarea"
                className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
              >
                {t('editor.fieldContent')} <span className="text-red-500">*</span>
              </label>
              {type === 'template' && (
                <span className="text-[11px] text-amber-600 dark:text-amber-400">
                  {t('editor.templateHint')}
                </span>
              )}
            </div>
            <textarea
              id="snippet-content-textarea"
              rows={type === 'code' ? 10 : 7}
              value={content}
              onKeyDown={handleContentKeyDown}
              onChange={(e) => {
                setContent(e.target.value);
                if (errors.content) setErrors((prev) => ({ ...prev, content: undefined }));
              }}
              placeholder={t('editor.fieldContentPlaceholder')}
              spellCheck={type !== 'code'}
              className={`mt-1 w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-surface-950 dark:text-zinc-100 dark:placeholder-zinc-500 ${
                type === 'code' || type === 'template' ? 'font-mono text-xs leading-relaxed' : ''
              }`}
            />
            {errors.content && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{t(errors.content)}</span>
              </p>
            )}

            {/* Live discovered template variables preview */}
            {(type === 'template' || parsedTemplate.variables.length > 0) && (
              <div className="mt-2 rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Braces className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {t('editor.detectedVariables')}
                  </span>
                  {parsedTemplate.variables.length > 0 ? (
                    parsedTemplate.variables.map((v) => (
                      <span
                        key={v}
                        className="rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-[11px] font-medium text-amber-800 dark:text-amber-300"
                      >
                        {`{{${v}}}`}
                      </span>
                    ))
                  ) : (
                    <span className="text-zinc-500">—</span>
                  )}
                </div>
                {parsedTemplate.invalidTokens.length > 0 && (
                  <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">
                    {t('editor.invalidPlaceholders')}{' '}
                    <span className="font-mono">{parsedTemplate.invalidTokens.join(', ')}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="snippet-description-input"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
            >
              {t('editor.fieldDescription')}
            </label>
            <input
              id="snippet-description-input"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('editor.fieldDescriptionPlaceholder')}
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-surface-950 dark:text-zinc-100"
            />
          </div>

          {/* Tags & Optional Source URL */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="snippet-tags-input"
                className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
              >
                {t('editor.fieldTags')}
              </label>
              <div className="mt-1 flex gap-1.5">
                <input
                  id="snippet-tags-input"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder={t('editor.fieldTagsPlaceholder')}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-surface-950 dark:text-zinc-100"
                />
                <button
                  type="button"
                  onClick={() => addTag(tagInput)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md border border-zinc-300 bg-zinc-50 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-surface-800 dark:text-zinc-200"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{t('editor.addTagButton')}</span>
                </button>
              </div>
              {tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        aria-label={`Remove ${tag}`}
                        className="hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="snippet-url-input"
                className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
              >
                {t('editor.fieldSourceUrl')}
              </label>
              <input
                id="snippet-url-input"
                type="text"
                value={sourceUrl}
                onChange={(e) => {
                  setSourceUrl(e.target.value);
                  if (errors.sourceUrl)
                    setErrors((prev) => ({ ...prev, sourceUrl: undefined }));
                }}
                placeholder={t('editor.fieldSourceUrlPlaceholder')}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-surface-950 dark:text-zinc-100"
              />
              {errors.sourceUrl && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{t(errors.sourceUrl)}</span>
                </p>
              )}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-zinc-200 px-5 py-3.5 dark:border-zinc-800">
          <span className="hidden text-xs text-zinc-500 sm:inline">
            {t('editor.shortcutSaveHint')}
          </span>
          <div className="ml-auto flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-zinc-300 bg-white px-3.5 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-surface-800 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {t('action.cancel')}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => void handleSubmit()}
              className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {editingSnippet ? t('action.save') : t('action.create')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
