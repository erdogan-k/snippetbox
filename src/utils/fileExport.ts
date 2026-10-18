import { Snippet, CODE_LANGUAGES, SnippetInput } from '../types/snippet';

/**
 * Determines the appropriate file extension for an individual snippet export.
 * Code snippets use their language extension when known; otherwise .txt or .md.
 */
export function getSnippetExportFilename(
  snippet: Snippet,
  preferredFormat: 'auto' | 'txt' | 'md' = 'auto'
): string {
  const safeBase =
    snippet.title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'snippet';

  if (preferredFormat === 'txt') {
    return `${safeBase}.txt`;
  }
  if (preferredFormat === 'md') {
    return `${safeBase}.md`;
  }

  if (snippet.type === 'code' && snippet.language) {
    const langMatch = CODE_LANGUAGES.find(
      (l) => l.value.toLowerCase() === snippet.language?.toLowerCase()
    );
    if (langMatch) {
      return `${safeBase}.${langMatch.ext}`;
    }
  }

  return `${safeBase}.txt`;
}

/**
 * Formats a snippet as Markdown or raw content for individual file export.
 */
export function formatSnippetExportContent(
  snippet: Snippet,
  format: 'raw' | 'md' = 'raw'
): string {
  if (format === 'md') {
    const lines: string[] = [`# ${snippet.title}`, ''];
    if (snippet.description) {
      lines.push(`> ${snippet.description}`, '');
    }
    lines.push(
      `- **Category:** ${snippet.category}`,
      `- **Type:** ${snippet.type}`,
    );
    if (snippet.tags.length > 0) {
      lines.push(`- **Tags:** ${snippet.tags.join(', ')}`);
    }
    if (snippet.sourceUrl) {
      lines.push(`- **Source:** ${snippet.sourceUrl}`);
    }
    lines.push('');
    if (snippet.type === 'code') {
      lines.push(`\`\`\`${snippet.language || ''}`, snippet.content, '```');
    } else {
      lines.push(snippet.content);
    }
    return lines.join('\n');
  }

  return snippet.content;
}

/**
 * Triggers a browser file download.
 */
export function triggerFileDownload(
  content: string,
  filename: string,
  mimeType = 'text/plain;charset=utf-8'
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Parses a plain text or code file into a SnippetInput object.
 */
export function parsePlainTextFileToSnippet(
  filename: string,
  content: string,
  defaultCategory = 'General'
): SnippetInput {
  const lastDot = filename.lastIndexOf('.');
  const rawName = lastDot > 0 ? filename.slice(0, lastDot) : filename;
  const ext = lastDot > 0 ? filename.slice(lastDot + 1).toLowerCase() : '';

  const title = rawName.replace(/[-_]+/g, ' ').trim() || 'Imported Snippet';
  const matchedLang = CODE_LANGUAGES.find(
    (l) => l.ext === ext && ext !== 'txt' && ext !== 'md'
  );

  const hasTemplateVars = /\{\{[a-zA-Z_][a-zA-Z0-9_.-]*\}\}/.test(content);

  if (matchedLang) {
    return {
      title,
      content,
      type: 'code',
      language: matchedLang.value,
      category: 'Programming',
      tags: ['imported', matchedLang.value],
      isFavorite: false,
    };
  }

  if (hasTemplateVars) {
    return {
      title,
      content,
      type: 'template',
      category: defaultCategory,
      tags: ['imported', 'template'],
      isFavorite: false,
    };
  }

  return {
    title,
    content,
    type: 'text',
    category: defaultCategory,
    tags: ['imported'],
    isFavorite: false,
  };
}
