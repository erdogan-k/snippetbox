import { describe, it, expect, beforeEach } from 'vitest';
import {
  isValidVariableName,
  parseTemplateVariables,
  renderTemplate,
} from '../utils/templateEngine';
import { filterAndSortSnippets } from '../utils/searchAndFilter';
import {
  validateAndMigrateImportBundle,
  validateSnippetInput,
} from '../utils/validation';
import {
  clearAllData,
  createCategory,
  createSnippet,
  deleteCategory,
  duplicateSnippet,
  emptyTrash,
  ensureInitialCategories,
  executeImportBundle,
  exportDatabaseBundle,
  getAllSnippets,
  moveSnippetToTrash,
  recordSnippetUsage,
  restoreSnippetFromTrash,
  updateSnippet,
} from '../services/db';
import {
  CURRENT_EXPORT_SCHEMA_VERSION,
  SearchFilterCriteria,
  Snippet,
} from '../types/snippet';

const defaultCriteria: SearchFilterCriteria = {
  query: '',
  section: 'all',
  category: 'ALL',
  type: 'ALL',
  tag: 'ALL',
  onlyFavorites: false,
  sortBy: 'updatedAt',
  sortDirection: 'desc',
};

describe('1. Dynamic Template Engine', () => {
  it('extracts unique valid variable names in order of appearance and ignores duplicates', () => {
    const template =
      'Hello {{name}},\nYour order {{order_id}} for {{product.name}} is ready, {{name}}!';
    const parsed = parseTemplateVariables(template);

    expect(parsed.variables).toEqual(['name', 'order_id', 'product.name']);
    expect(parsed.invalidTokens).toEqual([]);
  });

  it('identifies malformed placeholder tokens without crashing', () => {
    const template = 'Valid: {{user_name}}, Invalid: {{123bad}} and {{}} and {{bad space}}';
    const parsed = parseTemplateVariables(template);

    expect(parsed.variables).toEqual(['user_name']);
    expect(parsed.invalidTokens).toEqual(['{{123bad}}', '{{}}', '{{bad space}}']);
    expect(isValidVariableName('user_name')).toBe(true);
    expect(isValidVariableName('123bad')).toBe(false);
  });

  it('renders exact expected output for the specification example and repeated variables', () => {
    const template = 'Hello {{name}},\n\nYour order {{order_id}} is ready.';
    const result = renderTemplate(template, {
      name: 'Alex',
      order_id: '4821',
    });

    expect(result.rendered).toBe('Hello Alex,\n\nYour order 4821 is ready.');
    expect(result.missingVariables).toEqual([]);
    expect(result.replacedCount).toBe(2);
  });

  it('handles missing template variables visibly instead of silently deleting placeholders', () => {
    const template = 'Hello {{name}}, your ticket {{ticket_id}} is assigned to {{agent}}.';
    const result = renderTemplate(template, {
      name: 'Sam',
      ticket_id: '',
    });

    expect(result.rendered).toBe(
      'Hello Sam, your ticket {{ticket_id}} is assigned to {{agent}}.'
    );
    expect(result.missingVariables).toEqual(['ticket_id', 'agent']);
  });

  it('supports multiline values and treats HTML/JS strings strictly as literal text', () => {
    const template = 'Notes:\n{{notes}}\nPayload: {{payload}}';
    const result = renderTemplate(template, {
      notes: '- Line 1\n- Line 2',
      payload: '<script>alert("xss")</script>',
    });

    expect(result.rendered).toContain('- Line 1\n- Line 2');
    expect(result.rendered).toContain('<script>alert("xss")</script>');
  });
});

describe('2. Search, Combined Filtering, and Sorting', () => {
  const sampleItems: Snippet[] = [
    {
      id: 'snp_1',
      title: 'Docker Prune Command',
      content: 'docker system prune -af --volumes',
      description: 'Clean up unused containers and volumes',
      type: 'code',
      language: 'bash',
      category: 'Commands',
      tags: ['docker', 'cli', 'devops'],
      isFavorite: true,
      createdAt: 1000,
      updatedAt: 3000,
      lastUsedAt: 5000,
      usageCount: 12,
      status: 'active',
    },
    {
      id: 'snp_2',
      title: 'Customer Refund Template',
      content: 'Dear {{customer}}, your refund of {{amount}} has been processed.',
      description: 'Standard billing support email',
      type: 'template',
      category: 'Email',
      tags: ['support', 'billing'],
      isFavorite: false,
      createdAt: 2000,
      updatedAt: 4000,
      lastUsedAt: 2500,
      usageCount: 4,
      status: 'active',
    },
    {
      id: 'snp_3',
      title: 'TypeScript Debounce Helper',
      content: 'export function debounce(fn: Function, ms = 300) {}',
      description: 'Utility function for frontend apps',
      type: 'code',
      language: 'typescript',
      category: 'Programming',
      tags: ['typescript', 'frontend', 'utils'],
      isFavorite: true,
      createdAt: 3000,
      updatedAt: 2000,
      lastUsedAt: null,
      usageCount: 0,
      status: 'active',
    },
    {
      id: 'snp_4',
      title: 'Deleted Secret Note',
      content: 'Should not appear in normal search',
      type: 'text',
      category: 'General',
      tags: ['docker', 'secret'],
      isFavorite: true,
      createdAt: 1500,
      updatedAt: 6000,
      lastUsedAt: 6000,
      usageCount: 99,
      status: 'trashed',
    },
  ];

  it('matches search queries across title, content, description, tags, and category (case-insensitive)', () => {
    // Match by title
    expect(
      filterAndSortSnippets(sampleItems, { ...defaultCriteria, query: 'debounce' }).map(
        (s) => s.id
      )
    ).toEqual(['snp_3']);

    // Match by content
    expect(
      filterAndSortSnippets(sampleItems, { ...defaultCriteria, query: '--VOLUMES' }).map(
        (s) => s.id
      )
    ).toEqual(['snp_1']);

    // Match by description
    expect(
      filterAndSortSnippets(sampleItems, {
        ...defaultCriteria,
        query: 'billing support',
      }).map((s) => s.id)
    ).toEqual(['snp_2']);

    // Match by tag (while excluding trashed snp_4)
    expect(
      filterAndSortSnippets(sampleItems, { ...defaultCriteria, query: 'devops' }).map(
        (s) => s.id
      )
    ).toEqual(['snp_1']);

    // Match by category
    expect(
      filterAndSortSnippets(sampleItems, {
        ...defaultCriteria,
        query: 'programming',
      }).map((s) => s.id)
    ).toEqual(['snp_3']);
  });

  it('applies combined filters (category + type + tag + favorites) accurately', () => {
    const combined = filterAndSortSnippets(sampleItems, {
      ...defaultCriteria,
      type: 'code',
      onlyFavorites: true,
      category: 'Commands',
      tag: 'docker',
    });

    expect(combined).toHaveLength(1);
    expect(combined[0].id).toBe('snp_1');
  });

  it('sorts snippets by title, createdAt, updatedAt, and usageCount', () => {
    const byTitleAsc = filterAndSortSnippets(sampleItems, {
      ...defaultCriteria,
      sortBy: 'title',
      sortDirection: 'asc',
    });
    expect(byTitleAsc.map((s) => s.id)).toEqual(['snp_2', 'snp_1', 'snp_3']);

    const byCreatedDesc = filterAndSortSnippets(sampleItems, {
      ...defaultCriteria,
      sortBy: 'createdAt',
      sortDirection: 'desc',
    });
    expect(byCreatedDesc.map((s) => s.id)).toEqual(['snp_3', 'snp_2', 'snp_1']);

    const byUsageDesc = filterAndSortSnippets(sampleItems, {
      ...defaultCriteria,
      sortBy: 'usageCount',
      sortDirection: 'desc',
    });
    expect(byUsageDesc.map((s) => s.id)).toEqual(['snp_1', 'snp_2', 'snp_3']);
  });
});

describe('3. IndexedDB Persistence, Usage Counts, Trash & Restore, and Import/Export', () => {
  beforeEach(async () => {
    await clearAllData();
    await ensureInitialCategories();
  });

  it('validates snippet input and trims accidental whitespace from titles', () => {
    const invalid = validateSnippetInput({ title: '   ', content: '' });
    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.title).toBe('validation.titleRequired');
    expect(invalid.errors.content).toBe('validation.contentRequired');

    const valid = validateSnippetInput({
      title: '  Clean Title  ',
      content: 'Line 1\n  Indented Line 2',
      type: 'code',
      category: 'Programming',
      tags: [' ts ', 'ts', ''],
    });
    expect(valid.isValid).toBe(true);
    expect(valid.sanitized?.title).toBe('Clean Title');
    expect(valid.sanitized?.content).toBe('Line 1\n  Indented Line 2');
    expect(valid.sanitized?.tags).toEqual(['ts']);
  });

  it('increments usage count, updates lastUsedAt, and preserves metadata on edit', async () => {
    const created = await createSnippet({
      title: 'API Health Check',
      content: 'curl -i https://example.com/health',
      type: 'code',
      language: 'bash',
      category: 'Commands',
      tags: ['curl'],
      isFavorite: true,
    });

    expect(created.usageCount).toBe(0);
    expect(created.lastUsedAt).toBeNull();

    const afterFirstCopy = await recordSnippetUsage(created.id);
    expect(afterFirstCopy.usageCount).toBe(1);
    expect(typeof afterFirstCopy.lastUsedAt).toBe('number');

    const afterSecondCopy = await recordSnippetUsage(created.id);
    expect(afterSecondCopy.usageCount).toBe(2);

    // Editing title should preserve usageCount, createdAt, and lastUsedAt
    const edited = await updateSnippet(created.id, {
      title: 'Updated API Health Check',
    });
    expect(edited.title).toBe('Updated API Health Check');
    expect(edited.usageCount).toBe(2);
    expect(edited.createdAt).toBe(created.createdAt);
    expect(edited.lastUsedAt).toBe(afterSecondCopy.lastUsedAt);
  });

  it('handles trash, restore, category fallback on restore, and empty trash', async () => {
    const customCat = await createCategory('TemporaryOps');
    const item = await createSnippet({
      title: 'Temp Runbook',
      content: 'kubectl get pods',
      type: 'code',
      category: 'TemporaryOps',
      tags: ['k8s'],
      isFavorite: true,
    });

    const trashed = await moveSnippetToTrash(item.id);
    expect(trashed.status).toBe('trashed');

    // Trashed item must not appear in ordinary search results
    const allSnippets = await getAllSnippets();
    const visibleInAll = filterAndSortSnippets(allSnippets, defaultCriteria);
    expect(visibleInAll).toHaveLength(0);

    // Delete the custom category while item is in trash
    await deleteCategory(customCat.id, 'General');

    // Restore item: favorite status preserved, deleted category safely moved to General
    const restored = await restoreSnippetFromTrash(item.id);
    expect(restored.status).toBe('active');
    expect(restored.isFavorite).toBe(true);
    expect(restored.category).toBe('General');

    // Move back to trash and empty trash
    await moveSnippetToTrash(item.id);
    const deletedCount = await emptyTrash();
    expect(deletedCount).toBe(1);
    expect(await getAllSnippets()).toHaveLength(0);
  });

  it('validates import schemas, rejects unsupported versions or malformed records, and handles duplicate IDs safely on round-trip', async () => {
    // Reject unsupported future schema version
    const futureBundle = validateAndMigrateImportBundle({
      appName: 'SnippetBox',
      schemaVersion: 999,
      snippets: [],
    });
    expect(futureBundle.isValid).toBe(false);
    expect(futureBundle.errorKey).toBe('import.errorUnsupportedSchemaVersion');

    // Reject bundle containing malformed records instead of silently discarding them
    const malformedBundle = validateAndMigrateImportBundle({
      appName: 'SnippetBox',
      schemaVersion: CURRENT_EXPORT_SCHEMA_VERSION,
      snippets: [
        {
          id: 'valid_1',
          title: 'Good Snippet',
          content: 'Hello',
          type: 'text',
          category: 'General',
          tags: [],
        },
        {
          id: 'broken_2',
          title: '', // invalid empty title
          content: '',
          type: 'invalid_type',
        },
      ],
    });
    expect(malformedBundle.isValid).toBe(false);
    expect(malformedBundle.errorKey).toBe('import.errorMalformedRecords');
    expect(malformedBundle.invalidRecordCount).toBe(1);

    // Full Export -> Import round-trip and duplicate ID handling
    const s1 = await createSnippet({
      title: 'Original Template',
      content: 'Hi {{user}}',
      type: 'template',
      category: 'Email',
      tags: ['greeting'],
      isFavorite: true,
    });
    await recordSnippetUsage(s1.id);

    const exported = await exportDatabaseBundle();
    expect(exported.schemaVersion).toBe(CURRENT_EXPORT_SCHEMA_VERSION);
    expect(exported.snippets).toHaveLength(1);

    const validated = validateAndMigrateImportBundle(exported);
    expect(validated.isValid).toBe(true);

    // Simulate importing a colliding ID with DIFFERENT content in merge mode
    const collidingSnippet: Snippet = {
      ...validated.validSnippets[0],
      title: 'Different Snippet With Colliding ID',
      content: 'Completely different content',
    };

    const mergeResult = await executeImportBundle(
      [collidingSnippet],
      validated.categories,
      'merge'
    );

    expect(mergeResult.reassignedDuplicateIds).toBe(1);
    const afterMerge = await getAllSnippets();
    expect(afterMerge).toHaveLength(2);

    // Also verify duplicate snippet helper creates a new permanent ID
    const dup = await duplicateSnippet(s1.id);
    expect(dup.id).not.toBe(s1.id);
    expect(dup.usageCount).toBe(0);
  });
});
