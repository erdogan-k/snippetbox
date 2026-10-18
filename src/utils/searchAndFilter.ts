import { Snippet, SearchFilterCriteria } from '../types/snippet';

/**
 * Filters and sorts snippets according to navigation section, search query,
 * category, type, tag, favorites toggle, and sort options.
 * Trashed items never appear in ordinary sections or search results.
 */
export function filterAndSortSnippets(
  snippets: Snippet[],
  criteria: SearchFilterCriteria
): Snippet[] {
  const normalizedQuery = criteria.query.trim().toLowerCase();

  const filtered = snippets.filter((snippet) => {
    // 1. Section & Trash isolation
    if (criteria.section === 'trash') {
      if (snippet.status !== 'trashed') return false;
    } else if (criteria.section === 'archived') {
      if (snippet.status !== 'archived') return false;
    } else {
      // Ordinary views only show active items (never trashed or archived)
      if (snippet.status !== 'active') return false;
    }

    // 2. Navigation section specifics
    if (criteria.section === 'favorites' && !snippet.isFavorite) {
      return false;
    }
    if (criteria.section === 'templates' && snippet.type !== 'template') {
      return false;
    }
    if (criteria.section === 'code' && snippet.type !== 'code') {
      return false;
    }
    if (criteria.section === 'text' && snippet.type !== 'text' && snippet.type !== 'link') {
      return false;
    }
    if (criteria.section === 'recent' && (!snippet.lastUsedAt || snippet.usageCount <= 0)) {
      return false;
    }

    // 3. Explicit filters (Category, Type, Tag, Favorites)
    if (
      criteria.category !== 'ALL' &&
      snippet.category.toLowerCase() !== criteria.category.toLowerCase()
    ) {
      return false;
    }

    if (criteria.type !== 'ALL' && snippet.type !== criteria.type) {
      return false;
    }

    if (
      criteria.tag !== 'ALL' &&
      !snippet.tags.some((t) => t.toLowerCase() === criteria.tag.toLowerCase())
    ) {
      return false;
    }

    if (criteria.onlyFavorites && !snippet.isFavorite) {
      return false;
    }

    // 4. Instant case-insensitive search across Title, Content, Description, Tags, Category
    if (normalizedQuery.length > 0) {
      const inTitle = snippet.title.toLowerCase().includes(normalizedQuery);
      const inContent = snippet.content.toLowerCase().includes(normalizedQuery);
      const inDesc = (snippet.description ?? '').toLowerCase().includes(normalizedQuery);
      const inCategory = snippet.category.toLowerCase().includes(normalizedQuery);
      const inTags = snippet.tags.some((tag) =>
        tag.toLowerCase().includes(normalizedQuery)
      );
      const inUrl = (snippet.sourceUrl ?? '').toLowerCase().includes(normalizedQuery);

      if (!inTitle && !inContent && !inDesc && !inCategory && !inTags && !inUrl) {
        return false;
      }
    }

    return true;
  });

  // 5. Sorting
  const sorted = [...filtered].sort((a, b) => {
    // Special default sort for 'recent' section when user hasn't forced another sort
    if (criteria.section === 'recent' && criteria.sortBy === 'updatedAt') {
      const aUsed = a.lastUsedAt ?? 0;
      const bUsed = b.lastUsedAt ?? 0;
      if (bUsed !== aUsed) return bUsed - aUsed;
    }

    let comparison = 0;
    switch (criteria.sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        break;
      case 'createdAt':
        comparison = a.createdAt - b.createdAt;
        break;
      case 'usageCount':
        comparison = a.usageCount - b.usageCount;
        if (comparison === 0) {
          comparison = (a.lastUsedAt ?? 0) - (b.lastUsedAt ?? 0);
        }
        break;
      case 'updatedAt':
      default:
        comparison = a.updatedAt - b.updatedAt;
        break;
    }

    return criteria.sortDirection === 'asc' ? comparison : -comparison;
  });

  return sorted;
}
