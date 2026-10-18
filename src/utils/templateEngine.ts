/**
 * Dynamic Template Engine for SnippetBox
 * Parses {{variable_name}} placeholders safely without eval/Function.
 * Treats inserted values strictly as literal text.
 */

export interface TemplateParseResult {
  /** Unique valid variable names in order of first appearance */
  variables: string[];
  /** Invalid placeholder tokens discovered (e.g. {{123-invalid}} or {{}}) */
  invalidTokens: string[];
}

export interface TemplateRenderResult {
  rendered: string;
  missingVariables: string[];
  replacedCount: number;
}

const VALID_VARIABLE_NAME_REGEX = /^[a-zA-Z_][a-zA-Z0-9_.-]*$/;
const PLACEHOLDER_TOKEN_REGEX = /\{\{([^{}]*)\}\}/g;

/**
 * Validates whether a variable name is well-formed.
 */
export function isValidVariableName(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 64) return false;
  return VALID_VARIABLE_NAME_REGEX.test(trimmed);
}

/**
 * Extracts unique variables and invalid placeholder tokens from template content.
 */
export function parseTemplateVariables(templateContent: string): TemplateParseResult {
  const variables: string[] = [];
  const seenVariables = new Set<string>();
  const invalidTokens: string[] = [];
  const seenInvalid = new Set<string>();

  if (!templateContent) {
    return { variables: [], invalidTokens: [] };
  }

  let match: RegExpExecArray | null;
  const regex = new RegExp(PLACEHOLDER_TOKEN_REGEX.source, 'g');

  while ((match = regex.exec(templateContent)) !== null) {
    const rawInside = match[1];
    const trimmed = rawInside.trim();

    if (isValidVariableName(trimmed)) {
      if (!seenVariables.has(trimmed)) {
        seenVariables.add(trimmed);
        variables.push(trimmed);
      }
    } else {
      const tokenLabel = `{{${rawInside}}}`;
      if (!seenInvalid.has(tokenLabel)) {
        seenInvalid.add(tokenLabel);
        invalidTokens.push(tokenLabel);
      }
    }
  }

  return { variables, invalidTokens };
}

/**
 * Renders a template using the provided variable values map.
 * Missing or empty variables remain visibly marked (either as `{{var}}` or custom fallback)
 * instead of silently deleting placeholders.
 * Never executes code or interprets HTML.
 */
export function renderTemplate(
  templateContent: string,
  values: Record<string, string>,
  options?: { preserveMissingPlaceholder?: boolean }
): TemplateRenderResult {
  const preserveMissing = options?.preserveMissingPlaceholder ?? true;
  const missingSet = new Set<string>();
  let replacedCount = 0;

  if (!templateContent) {
    return { rendered: '', missingVariables: [], replacedCount: 0 };
  }

  const regex = new RegExp(PLACEHOLDER_TOKEN_REGEX.source, 'g');
  const rendered = templateContent.replace(regex, (fullMatch, rawInside: string) => {
    const varName = rawInside.trim();
    if (!isValidVariableName(varName)) {
      // Leave invalid placeholders untouched so the user sees them as literal text
      return fullMatch;
    }

    const hasValue =
      Object.prototype.hasOwnProperty.call(values, varName) &&
      values[varName] !== undefined &&
      values[varName] !== '';

    if (hasValue) {
      replacedCount += 1;
      return String(values[varName]);
    } else {
      missingSet.add(varName);
      return preserveMissing ? `{{${varName}}}` : `[missing: ${varName}]`;
    }
  });

  return {
    rendered,
    missingVariables: Array.from(missingSet),
    replacedCount,
  };
}
