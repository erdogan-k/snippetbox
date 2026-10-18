import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Check, Folder, AlertCircle } from 'lucide-react';
import { CategoryItem, InterfaceLanguage, Snippet } from '../types/snippet';
import { translate } from '../i18n/translations';

interface CategoryManagerModalProps {
  isOpen: boolean;
  categories: CategoryItem[];
  snippets: Snippet[];
  lang: InterfaceLanguage;
  onCreateCategory: (name: string) => Promise<void>;
  onRenameCategory: (id: string, newName: string) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onClose: () => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  categories,
  snippets,
  lang,
  onCreateCategory,
  onRenameCategory,
  onDeleteCategory,
  onClose,
}) => {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const t = (key: string, params?: Record<string, string | number>) =>
    translate(lang, key, params);

  useEffect(() => {
    if (!isOpen) return;
    setNewName('');
    setEditingId(null);
    setErrorMsg(null);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getCount = (catName: string) =>
    snippets.filter(
      (s) => s.status !== 'trashed' && s.category.toLowerCase() === catName.toLowerCase()
    ).length;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await onCreateCategory(newName);
      setNewName('');
    } catch (err) {
      const key = err instanceof Error ? err.message : 'category.invalidName';
      setErrorMsg(t(key));
    }
  };

  const handleSaveRename = async (id: string) => {
    setErrorMsg(null);
    try {
      await onRenameCategory(id, editingValue);
      setEditingId(null);
    } catch (err) {
      const key = err instanceof Error ? err.message : 'category.invalidName';
      setErrorMsg(t(key));
    }
  };

  const handleDelete = async (id: string) => {
    setErrorMsg(null);
    try {
      await onDeleteCategory(id);
    } catch (err) {
      const key = err instanceof Error ? err.message : 'category.cannotDeleteGeneral';
      setErrorMsg(t(key));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-modal-title"
    >
      <div className="flex max-h-[85vh] w-full max-w-md flex-col rounded-lg border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-surface-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3.5 dark:border-zinc-800">
          <h2
            id="category-modal-title"
            className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
          >
            {t('category.manageTitle')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('action.close')}
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setErrorMsg(null);
              }}
              placeholder={t('category.newPlaceholder')}
              className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-surface-950 dark:text-zinc-100"
            />
            <button
              type="submit"
              className="inline-flex shrink-0 items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t('category.addButton')}</span>
            </button>
          </form>

          {errorMsg && (
            <div className="flex items-center gap-1.5 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t('category.deleteNote')}
          </p>

          <ul className="divide-y divide-zinc-200 rounded-md border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {categories.map((cat) => {
              const isGeneral = cat.name.toLowerCase() === 'general';
              const isEditing = editingId === cat.id;
              const count = getCount(cat.name);

              return (
                <li
                  key={cat.id}
                  className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm"
                >
                  {isEditing ? (
                    <div className="flex flex-1 items-center gap-1.5">
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') void handleSaveRename(cat.id);
                        }}
                        autoFocus
                        className="w-full rounded border border-indigo-500 bg-white px-2 py-1 text-xs text-zinc-900 dark:bg-surface-950 dark:text-zinc-100"
                      />
                      <button
                        type="button"
                        onClick={() => void handleSaveRename(cat.id)}
                        aria-label={t('category.saveRename')}
                        className="rounded bg-indigo-600 p-1 text-white hover:bg-indigo-500"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex min-w-0 items-center gap-2">
                      <Folder className="h-4 w-4 shrink-0 text-zinc-400" />
                      <span className="truncate font-medium text-zinc-800 dark:text-zinc-200">
                        {cat.name}
                      </span>
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] text-zinc-500 dark:bg-surface-800 dark:text-zinc-400">
                        {count}
                      </span>
                    </div>
                  )}

                  {!isGeneral && !isEditing && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(cat.id);
                          setEditingValue(cat.name);
                          setErrorMsg(null);
                        }}
                        aria-label={t('category.renameButton')}
                        title={t('category.renameButton')}
                        className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(cat.id)}
                        aria-label={t('category.deleteButton')}
                        title={t('category.deleteButton')}
                        className="rounded p-1 text-zinc-400 hover:bg-red-500/10 hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};
