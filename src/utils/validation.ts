import {
  Snippet,
  SnippetInput,
  SnippetType,
  SnippetStatus,
  CategoryItem,
  ExportBundleV1,
  CURRENT_EXPORT_SCHEMA_VERSION,
  INITIAL_CATEGORIES,
} from '../types/snippet';

export interface ValidationErrors {
  title?: string;
  content?: string;
  sourceUrl?: string;
  category?: string;
}

const VALID_TYPES: SnippetType[] = ['text', 'code', 'template', 'link'];
const VALID_STATUSES: SnippetStatus[] = ['active', 'archived', 'trashed'];

/**
 * Validates user input when creating or editing a snippet.
 */
export function validateSnippetInput(input: Partial<SnippetInput>): {
  isValid: boolean;
  errors: ValidationErrors;
  sanitized?: SnippetInput;
} {
  const errors: ValidationErrors = {};
  const trimmedTitle = (input.title ?? '').trim();
  const rawContent = input.content ?? '';
  const type: SnippetType = VALID_TYPES.includes(input.type as SnippetType)
    ? (input.type as SnippetType)
    : 'text';

  if (!trimmedTitle) {
    errors.title = 'validation.titleRequired';
  } else if (trimmedTitle.length > 160) {
    errors.title = 'validation.titleTooLong';
  }

  // Content is required across text, code, template, and link types
  if (!rawContent || rawContent.trim().length === 0) {
    errors.content = 'validation.contentRequired';
  }

  const trimmedUrl = (input.sourceUrl ?? '').trim();
  if (trimmedUrl) {
    try {
      const parsed = new URL(trimmedUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        errors.sourceUrl = 'validation.invalidUrl';
      }
    } catch {
      errors.sourceUrl = 'validation.invalidUrl';
    }
  }

  const category = (input.category ?? '').trim() || 'General';
  const tags = Array.from(
    new Set(
      (input.tags ?? [])
        .map((t) => String(t).trim())
        .filter((t) => t.length > 0 && t.length <= 40)
    )
  );

  const isValid = Object.keys(errors).length === 0;

  if (!isValid) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: {},
    sanitized: {
      title: trimmedTitle,
      content: rawContent,
      description: (input.description ?? '').trim() || undefined,
      type,
      category,
      tags,
      isFavorite: Boolean(input.isFavorite),
      language: type === 'code' ? (input.language || 'plaintext') : undefined,
      sourceUrl: trimmedUrl || undefined,
      shortcut: (input.shortcut ?? '').trim() || undefined,
      status: VALID_STATUSES.includes(input.status as SnippetStatus)
        ? (input.status as SnippetStatus)
        : 'active',
      isDemo: Boolean(input.isDemo),
    },
  };
}

export interface ImportValidationResult {
  isValid: boolean;
  errorKey?: string;
  errorDetail?: string;
  schemaVersion?: number;
  validSnippets: Snippet[];
  invalidRecordCount: number;
  invalidRecordReasons: string[];
  categories: CategoryItem[];
}

/**
 * Runtime validation of an individual Snippet object from JSON import.
 */
export function validateSnippetRecord(
  record: unknown,
  index: number
): { snippet?: Snippet; error?: string } {
  if (!record || typeof record !== 'object') {
    return { error: `Record #${index + 1}: Not an object` };
  }

  const obj = record as Record<string, unknown>;

  if (typeof obj.id !== 'string' || obj.id.trim().length === 0) {
    return { error: `Record #${index + 1}: Missing or invalid 'id'` };
  }

  if (typeof obj.title !== 'string' || obj.title.trim().length === 0) {
    return { error: `Record #${index + 1} (${obj.id}): Missing or empty 'title'` };
  }

  if (typeof obj.content !== 'string' || obj.content.length === 0) {
    return { error: `Record #${index + 1} (${obj.id}): Missing or empty 'content'` };
  }

  const type = obj.type as SnippetType;
  if (!VALID_TYPES.includes(type)) {
    return {
      error: `Record #${index + 1} (${obj.id}): Invalid snippet type '${String(obj.type)}'`,
    };
  }

  const status: SnippetStatus = VALID_STATUSES.includes(obj.status as SnippetStatus)
    ? (obj.status as SnippetStatus)
    : 'active';

  const now = Date.now();
  const createdAt =
    typeof obj.createdAt === 'number' && Number.isFinite(obj.createdAt)
      ? obj.createdAt
      : now;
  const updatedAt =
    typeof obj.updatedAt === 'number' && Number.isFinite(obj.updatedAt)
      ? obj.updatedAt
      : createdAt;
  const lastUsedAt =
    typeof obj.lastUsedAt === 'number' && Number.isFinite(obj.lastUsedAt)
      ? obj.lastUsedAt
      : null;
  const usageCount =
    typeof obj.usageCount === 'number' &&
    Number.isFinite(obj.usageCount) &&
    obj.usageCount >= 0
      ? Math.floor(obj.usageCount)
      : 0;

  const category =
    typeof obj.category === 'string' && obj.category.trim().length > 0
      ? obj.category.trim()
      : 'General';

  const tags = Array.isArray(obj.tags)
    ? Array.from(
        new Set(
          obj.tags
            .filter((t): t is string => typeof t === 'string')
            .map((t) => t.trim())
            .filter(Boolean)
        )
      )
    : [];

  return {
    snippet: {
      id: obj.id.trim(),
      title: obj.title.trim(),
      content: obj.content,
      description:
        typeof obj.description === 'string' && obj.description.trim()
          ? obj.description.trim()
          : undefined,
      type,
      category,
      tags,
      isFavorite: Boolean(obj.isFavorite),
      createdAt,
      updatedAt,
      lastUsedAt,
      usageCount,
      language:
        typeof obj.language === 'string' && obj.language.trim()
          ? obj.language.trim()
          : undefined,
      sourceUrl:
        typeof obj.sourceUrl === 'string' && obj.sourceUrl.trim()
          ? obj.sourceUrl.trim()
          : undefined,
      shortcut:
        typeof obj.shortcut === 'string' && obj.shortcut.trim()
          ? obj.shortcut.trim()
          : undefined,
      status,
      isDemo: Boolean(obj.isDemo),
    },
  };
}

/**
 * Migrates older schema payloads if needed (v0 legacy array/object -> v1)
 * and rejects future unsupported schema versions.
 */
export function validateAndMigrateImportBundle(rawJson: unknown): ImportValidationResult {
  if (!rawJson || typeof rawJson !== 'object') {
    return {
      isValid: false,
      errorKey: 'import.errorInvalidJsonStructure',
      validSnippets: [],
      invalidRecordCount: 0,
      invalidRecordReasons: [],
      categories: [],
    };
  }

  const data = rawJson as Record<string, unknown>;
  const rawVersion = data.schemaVersion;

  if (typeof rawVersion !== 'number' || !Number.isInteger(rawVersion)) {
    return {
      isValid: false,
      errorKey: 'import.errorMissingSchemaVersion',
      validSnippets: [],
      invalidRecordCount: 0,
      invalidRecordReasons: [],
      categories: [],
    };
  }

  if (rawVersion > CURRENT_EXPORT_SCHEMA_VERSION || rawVersion < 1) {
    return {
      isValid: false,
      errorKey: 'import.errorUnsupportedSchemaVersion',
      errorDetail: `v${rawVersion}`,
      schemaVersion: rawVersion,
      validSnippets: [],
      invalidRecordCount: 0,
      invalidRecordReasons: [],
      categories: [],
    };
  }

  if (!Array.isArray(data.snippets)) {
    return {
      isValid: false,
      errorKey: 'import.errorMissingSnippetsArray',
      schemaVersion: rawVersion,
      validSnippets: [],
      invalidRecordCount: 0,
      invalidRecordReasons: [],
      categories: [],
    };
  }

  const validSnippets: Snippet[] = [];
  const invalidRecordReasons: string[] = [];

  data.snippets.forEach((item, index) => {
    const res = validateSnippetRecord(item, index);
    if (res.snippet) {
      validSnippets.push(res.snippet);
    } else if (res.error) {
      invalidRecordReasons.push(res.error);
    }
  });

  // Do not silently discard malformed records: if there are malformed records, report them clearly
  if (invalidRecordReasons.length > 0) {
    return {
      isValid: false,
      errorKey: 'import.errorMalformedRecords',
      errorDetail: invalidRecordReasons.join('; '),
      schemaVersion: rawVersion,
      validSnippets,
      invalidRecordCount: invalidRecordReasons.length,
      invalidRecordReasons,
      categories: [],
    };
  }

  const categoryMap = new Map<string, CategoryItem>();
  const now = Date.now();

  if (Array.isArray(data.categories)) {
    for (const cat of data.categories) {
      if (cat && typeof cat === 'object') {
        const c = cat as Record<string, unknown>;
        if (typeof c.name === 'string' && c.name.trim()) {
          const trimmedName = c.name.trim();
          categoryMap.set(trimmedName.toLowerCase(), {
            id:
              typeof c.id === 'string' && c.id.trim()
                ? c.id.trim()
                : `cat-${trimmedName.toLowerCase().replace(/\s+/g, '-')}`,
            name: trimmedName,
            isBuiltIn: INITIAL_CATEGORIES.includes(trimmedName),
            createdAt: typeof c.createdAt === 'number' ? c.createdAt : now,
          });
        }
      }
    }
  }

  // Ensure any category referenced by a snippet is also included
  for (const s of validSnippets) {
    const key = s.category.toLowerCase();
    if (!categoryMap.has(key)) {
      categoryMap.set(key, {
        id: `cat-${key.replace(/\s+/g, '-')}`,
        name: s.category,
        isBuiltIn: INITIAL_CATEGORIES.includes(s.category),
        createdAt: now,
      });
    }
  }

  const bundle = data as unknown as ExportBundleV1;

  return {
    isValid: true,
    schemaVersion: bundle.schemaVersion,
    validSnippets,
    invalidRecordCount: 0,
    invalidRecordReasons: [],
    categories: Array.from(categoryMap.values()),
  };
}
