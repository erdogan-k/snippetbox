import { openDB, DBSchema, IDBPDatabase } from 'idb';
import {
  Snippet,
  SnippetInput,
  CategoryItem,
  AppPreferences,
  INITIAL_CATEGORIES,
  ExportBundleV1,
  CURRENT_EXPORT_SCHEMA_VERSION,
} from '../types/snippet';
import { validateSnippetInput } from '../utils/validation';

interface SnippetBoxDB extends DBSchema {
  snippets: {
    key: string;
    value: Snippet;
    indexes: {
      'by-category': string;
      'by-type': string;
      'by-status': string;
      'by-updated': number;
    };
  };
  categories: {
    key: string;
    value: CategoryItem;
  };
  preferences: {
    key: string;
    value: AppPreferences;
  };
}

const DB_NAME = 'snippetbox-local-db';
const DB_VERSION = 1;
const PREFS_KEY = 'user-preferences';

export const DEFAULT_PREFERENCES: AppPreferences = {
  theme: 'dark',
  language: 'en',
  defaultView: 'all',
  layoutMode: 'cards',
  defaultCategory: 'General',
  dismissedOnboarding: false,
};

let dbPromise: Promise<IDBPDatabase<SnippetBoxDB>> | null = null;

export function generateId(prefix = 'snp'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  const randomPart = Math.random().toString(36).substring(2, 11);
  const timePart = Date.now().toString(36);
  return `${prefix}_${timePart}_${randomPart}`;
}

export function getDB(): Promise<IDBPDatabase<SnippetBoxDB>> {
  if (!dbPromise) {
    dbPromise = openDB<SnippetBoxDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('snippets')) {
          const store = db.createObjectStore('snippets', { keyPath: 'id' });
          store.createIndex('by-category', 'category');
          store.createIndex('by-type', 'type');
          store.createIndex('by-status', 'status');
          store.createIndex('by-updated', 'updatedAt');
        }
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences');
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Resets the cached database connection (used in tests or full database reset).
 */
export async function resetDBConnection(): Promise<void> {
  if (dbPromise) {
    const db = await dbPromise;
    db.close();
    dbPromise = null;
  }
}

export async function ensureInitialCategories(): Promise<CategoryItem[]> {
  const db = await getDB();
  const existing = await db.getAll('categories');
  if (existing.length > 0) {
    // Ensure General always exists
    const hasGeneral = existing.some((c) => c.name.toLowerCase() === 'general');
    if (!hasGeneral) {
      const generalCat: CategoryItem = {
        id: 'cat-general',
        name: 'General',
        isBuiltIn: true,
        createdAt: Date.now(),
      };
      await db.put('categories', generalCat);
      existing.unshift(generalCat);
    }
    return existing.sort((a, b) => a.createdAt - b.createdAt);
  }

  const now = Date.now();
  const tx = db.transaction('categories', 'readwrite');
  const initialItems: CategoryItem[] = INITIAL_CATEGORIES.map((name, idx) => ({
    id: `cat-${name.toLowerCase()}`,
    name,
    isBuiltIn: true,
    createdAt: now + idx,
  }));

  for (const item of initialItems) {
    await tx.store.put(item);
  }
  await tx.done;
  return initialItems;
}

export async function getPreferences(): Promise<AppPreferences> {
  try {
    const db = await getDB();
    const saved = await db.get('preferences', PREFS_KEY);
    if (!saved) {
      await db.put('preferences', DEFAULT_PREFERENCES, PREFS_KEY);
      return { ...DEFAULT_PREFERENCES };
    }
    return { ...DEFAULT_PREFERENCES, ...saved };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export async function savePreferences(
  partial: Partial<AppPreferences>
): Promise<AppPreferences> {
  const db = await getDB();
  const current = await getPreferences();
  const updated: AppPreferences = { ...current, ...partial };
  await db.put('preferences', updated, PREFS_KEY);
  return updated;
}

export async function getAllSnippets(): Promise<Snippet[]> {
  const db = await getDB();
  return db.getAll('snippets');
}

export async function getSnippetById(id: string): Promise<Snippet | undefined> {
  const db = await getDB();
  return db.get('snippets', id);
}

export async function createSnippet(input: SnippetInput): Promise<Snippet> {
  const validation = validateSnippetInput(input);
  if (!validation.isValid || !validation.sanitized) {
    throw new Error(Object.values(validation.errors)[0] || 'Invalid snippet input');
  }

  const db = await getDB();
  const now = Date.now();
  const s = validation.sanitized;

  const newSnippet: Snippet = {
    id: generateId('snp'),
    title: s.title,
    content: s.content,
    description: s.description,
    type: s.type,
    category: s.category,
    tags: s.tags,
    isFavorite: Boolean(s.isFavorite),
    createdAt: now,
    updatedAt: now,
    lastUsedAt: null,
    usageCount: 0,
    language: s.language,
    sourceUrl: s.sourceUrl,
    shortcut: s.shortcut,
    status: s.status ?? 'active',
    isDemo: Boolean(s.isDemo),
  };

  await db.put('snippets', newSnippet);
  return newSnippet;
}

/**
 * Updates an existing snippet while strictly preserving unrelated metadata
 * (id, createdAt, lastUsedAt, usageCount, etc.).
 */
export async function updateSnippet(
  id: string,
  updates: Partial<SnippetInput>
): Promise<Snippet> {
  const db = await getDB();
  const existing = await db.get('snippets', id);
  if (!existing) {
    throw new Error(`Snippet with id ${id} not found`);
  }

  const mergedInput: SnippetInput = {
    title: updates.title !== undefined ? updates.title : existing.title,
    content: updates.content !== undefined ? updates.content : existing.content,
    description:
      updates.description !== undefined ? updates.description : existing.description,
    type: updates.type !== undefined ? updates.type : existing.type,
    category: updates.category !== undefined ? updates.category : existing.category,
    tags: updates.tags !== undefined ? updates.tags : existing.tags,
    isFavorite:
      updates.isFavorite !== undefined ? updates.isFavorite : existing.isFavorite,
    language: updates.language !== undefined ? updates.language : existing.language,
    sourceUrl: updates.sourceUrl !== undefined ? updates.sourceUrl : existing.sourceUrl,
    shortcut: updates.shortcut !== undefined ? updates.shortcut : existing.shortcut,
    status: updates.status !== undefined ? updates.status : existing.status,
    isDemo: updates.isDemo !== undefined ? updates.isDemo : existing.isDemo,
  };

  const validation = validateSnippetInput(mergedInput);
  if (!validation.isValid || !validation.sanitized) {
    throw new Error(Object.values(validation.errors)[0] || 'Invalid snippet update');
  }

  const s = validation.sanitized;
  const updated: Snippet = {
    ...existing,
    title: s.title,
    content: s.content,
    description: s.description,
    type: s.type,
    category: s.category,
    tags: s.tags,
    isFavorite: Boolean(s.isFavorite),
    language: s.language,
    sourceUrl: s.sourceUrl,
    shortcut: s.shortcut,
    status: s.status ?? existing.status,
    isDemo: Boolean(s.isDemo),
    updatedAt: Date.now(),
  };

  await db.put('snippets', updated);
  return updated;
}

export async function duplicateSnippet(
  id: string,
  copySuffix = ' (Copy)'
): Promise<Snippet> {
  const db = await getDB();
  const existing = await db.get('snippets', id);
  if (!existing) {
    throw new Error(`Snippet with id ${id} not found`);
  }

  const now = Date.now();
  const duplicated: Snippet = {
    ...existing,
    id: generateId('snp'),
    title: `${existing.title}${copySuffix}`.slice(0, 160),
    createdAt: now,
    updatedAt: now,
    lastUsedAt: null,
    usageCount: 0,
    status: 'active',
    isDemo: false,
  };

  await db.put('snippets', duplicated);
  return duplicated;
}

export async function recordSnippetUsage(id: string): Promise<Snippet> {
  const db = await getDB();
  const existing = await db.get('snippets', id);
  if (!existing) {
    throw new Error(`Snippet with id ${id} not found`);
  }

  const updated: Snippet = {
    ...existing,
    usageCount: (existing.usageCount || 0) + 1,
    lastUsedAt: Date.now(),
  };

  await db.put('snippets', updated);
  return updated;
}

export async function toggleSnippetFavorite(id: string): Promise<Snippet> {
  const db = await getDB();
  const existing = await db.get('snippets', id);
  if (!existing) {
    throw new Error(`Snippet with id ${id} not found`);
  }

  const updated: Snippet = {
    ...existing,
    isFavorite: !existing.isFavorite,
    updatedAt: Date.now(),
  };

  await db.put('snippets', updated);
  return updated;
}

export async function moveSnippetToTrash(id: string): Promise<Snippet> {
  const db = await getDB();
  const existing = await db.get('snippets', id);
  if (!existing) {
    throw new Error(`Snippet with id ${id} not found`);
  }

  const updated: Snippet = {
    ...existing,
    status: 'trashed',
    updatedAt: Date.now(),
  };

  await db.put('snippets', updated);
  return updated;
}

export async function archiveSnippet(id: string): Promise<Snippet> {
  const db = await getDB();
  const existing = await db.get('snippets', id);
  if (!existing) {
    throw new Error(`Snippet with id ${id} not found`);
  }

  const updated: Snippet = {
    ...existing,
    status: existing.status === 'archived' ? 'active' : 'archived',
    updatedAt: Date.now(),
  };

  await db.put('snippets', updated);
  return updated;
}

export async function restoreSnippetFromTrash(id: string): Promise<Snippet> {
  const db = await getDB();
  const existing = await db.get('snippets', id);
  if (!existing) {
    throw new Error(`Snippet with id ${id} not found`);
  }

  // Ensure the snippet's category still exists; if deleted, move to General
  const categories = await db.getAll('categories');
  const categoryExists = categories.some(
    (c) => c.name.toLowerCase() === existing.category.toLowerCase()
  );

  const updated: Snippet = {
    ...existing,
    category: categoryExists ? existing.category : 'General',
    status: 'active',
    updatedAt: Date.now(),
  };

  await db.put('snippets', updated);
  return updated;
}

export async function permanentlyDeleteSnippet(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('snippets', id);
}

export async function emptyTrash(): Promise<number> {
  const db = await getDB();
  const all = await db.getAll('snippets');
  const trashed = all.filter((s) => s.status === 'trashed');
  const tx = db.transaction('snippets', 'readwrite');
  for (const item of trashed) {
    await tx.store.delete(item.id);
  }
  await tx.done;
  return trashed.length;
}

// Category operations
export async function createCategory(name: string): Promise<CategoryItem> {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 48) {
    throw new Error('category.invalidName');
  }

  const db = await getDB();
  const all = await db.getAll('categories');
  const duplicate = all.some((c) => c.name.toLowerCase() === trimmed.toLowerCase());
  if (duplicate) {
    throw new Error('category.duplicateName');
  }

  const newCat: CategoryItem = {
    id: generateId('cat'),
    name: trimmed,
    isBuiltIn: false,
    createdAt: Date.now(),
  };

  await db.put('categories', newCat);
  return newCat;
}

export async function renameCategory(
  categoryId: string,
  newName: string
): Promise<{ category: CategoryItem; updatedSnippetsCount: number }> {
  const trimmed = newName.trim();
  if (!trimmed || trimmed.length > 48) {
    throw new Error('category.invalidName');
  }

  const db = await getDB();
  const target = await db.get('categories', categoryId);
  if (!target) {
    throw new Error('category.notFound');
  }

  if (target.name.toLowerCase() === 'general') {
    throw new Error('category.cannotRenameGeneral');
  }

  const allCategories = await db.getAll('categories');
  const duplicate = allCategories.some(
    (c) => c.id !== categoryId && c.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (duplicate) {
    throw new Error('category.duplicateName');
  }

  const oldName = target.name;
  const updatedCat: CategoryItem = {
    ...target,
    name: trimmed,
  };

  await db.put('categories', updatedCat);

  // Update all snippets that belonged to the old category name
  const allSnippets = await db.getAll('snippets');
  const affected = allSnippets.filter(
    (s) => s.category.toLowerCase() === oldName.toLowerCase()
  );

  if (affected.length > 0) {
    const tx = db.transaction('snippets', 'readwrite');
    for (const s of affected) {
      await tx.store.put({
        ...s,
        category: trimmed,
      });
    }
    await tx.done;
  }

  return { category: updatedCat, updatedSnippetsCount: affected.length };
}

/**
 * Safely deletes a category and moves all affected snippets to fallbackCategory (defaults to 'General').
 * Never silently deletes snippets.
 */
export async function deleteCategory(
  categoryId: string,
  fallbackCategory = 'General'
): Promise<{ movedSnippetsCount: number }> {
  const db = await getDB();
  const target = await db.get('categories', categoryId);
  if (!target) {
    throw new Error('category.notFound');
  }

  if (target.name.toLowerCase() === 'general') {
    throw new Error('category.cannotDeleteGeneral');
  }

  const allSnippets = await db.getAll('snippets');
  const affected = allSnippets.filter(
    (s) => s.category.toLowerCase() === target.name.toLowerCase()
  );

  if (affected.length > 0) {
    const tx = db.transaction('snippets', 'readwrite');
    for (const s of affected) {
      await tx.store.put({
        ...s,
        category: fallbackCategory,
      });
    }
    await tx.done;
  }

  await db.delete('categories', categoryId);
  return { movedSnippetsCount: affected.length };
}

export async function exportDatabaseBundle(): Promise<ExportBundleV1> {
  const db = await getDB();
  const [snippets, categories, preferences] = await Promise.all([
    db.getAll('snippets'),
    db.getAll('categories'),
    getPreferences(),
  ]);

  return {
    appName: 'SnippetBox',
    schemaVersion: CURRENT_EXPORT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    snippets,
    categories,
    preferences,
  };
}

export interface ImportExecutionResult {
  importedCount: number;
  updatedOrMergedCount: number;
  reassignedDuplicateIds: number;
}

/**
 * Executes an import in either 'merge' or 'replace' mode.
 * Handles duplicate IDs safely:
 * - In 'replace' mode: clears existing snippets and imports incoming items (deduplicating within the incoming set if needed).
 * - In 'merge' mode: if an incoming item has the same ID as an existing item:
 *   - If identical content & title, updates metadata/keeps latest.
 *   - If different content/title (collision of IDs), assigns a fresh unique ID so neither record is lost.
 */
export async function executeImportBundle(
  snippetsToImport: Snippet[],
  categoriesToImport: CategoryItem[],
  mode: 'merge' | 'replace'
): Promise<ImportExecutionResult> {
  const db = await getDB();
  let importedCount = 0;
  let updatedOrMergedCount = 0;
  let reassignedDuplicateIds = 0;

  if (mode === 'replace') {
    const clearTx = db.transaction(['snippets', 'categories'], 'readwrite');
    await clearTx.objectStore('snippets').clear();
    await clearTx.objectStore('categories').clear();
    await clearTx.done;
  }

  // Ensure initial + imported categories exist
  const existingCategories = await ensureInitialCategories();
  const categoryByName = new Map<string, CategoryItem>(
    existingCategories.map((c) => [c.name.toLowerCase(), c])
  );

  const catTx = db.transaction('categories', 'readwrite');
  for (const incCat of categoriesToImport) {
    const key = incCat.name.trim().toLowerCase();
    if (!categoryByName.has(key)) {
      const catToSave: CategoryItem = {
        id: incCat.id || generateId('cat'),
        name: incCat.name.trim(),
        isBuiltIn: INITIAL_CATEGORIES.includes(incCat.name.trim()),
        createdAt: incCat.createdAt || Date.now(),
      };
      await catTx.store.put(catToSave);
      categoryByName.set(key, catToSave);
    }
  }
  await catTx.done;

  const existingSnippets = await db.getAll('snippets');
  const existingMap = new Map<string, Snippet>(existingSnippets.map((s) => [s.id, s]));
  const seenIncomingIds = new Set<string>();

  const snipTx = db.transaction('snippets', 'readwrite');
  for (const incoming of snippetsToImport) {
    let targetId = incoming.id;

    // Handle duplicate ID inside the imported file itself
    if (seenIncomingIds.has(targetId)) {
      targetId = generateId('snp');
      reassignedDuplicateIds += 1;
    }

    const existing = existingMap.get(targetId);
    if (existing && mode === 'merge') {
      const isSameSnippet =
        existing.title.trim() === incoming.title.trim() &&
        existing.content === incoming.content &&
        existing.type === incoming.type;

      if (isSameSnippet) {
        // Update existing record preserving higher usageCount and latest timestamps
        const merged: Snippet = {
          ...existing,
          ...incoming,
          id: existing.id,
          usageCount: Math.max(existing.usageCount, incoming.usageCount),
          lastUsedAt:
            existing.lastUsedAt && incoming.lastUsedAt
              ? Math.max(existing.lastUsedAt, incoming.lastUsedAt)
              : existing.lastUsedAt ?? incoming.lastUsedAt,
          tags: Array.from(new Set([...existing.tags, ...incoming.tags])),
        };
        await snipTx.store.put(merged);
        updatedOrMergedCount += 1;
      } else {
        // Different snippet sharing the same ID: assign a new ID so no user data is overwritten
        const reassigned: Snippet = {
          ...incoming,
          id: generateId('snp'),
        };
        await snipTx.store.put(reassigned);
        seenIncomingIds.add(reassigned.id);
        reassignedDuplicateIds += 1;
        importedCount += 1;
      }
    } else {
      const toSave: Snippet = {
        ...incoming,
        id: targetId,
      };
      await snipTx.store.put(toSave);
      importedCount += 1;
    }

    seenIncomingIds.add(targetId);
  }
  await snipTx.done;

  return {
    importedCount,
    updatedOrMergedCount,
    reassignedDuplicateIds,
  };
}

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['snippets', 'categories'], 'readwrite');
  await tx.objectStore('snippets').clear();
  await tx.objectStore('categories').clear();
  await tx.done;
  await ensureInitialCategories();
}
