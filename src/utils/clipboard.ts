/**
 * Clipboard helper with primary Clipboard API support and textarea fallback.
 * Never reports success if copying failed.
 */

export interface CopyResult {
  ok: boolean;
  error?: string;
}

export async function copyTextToClipboard(text: string): Promise<CopyResult> {
  if (typeof text !== 'string') {
    return { ok: false, error: 'Invalid content to copy' };
  }

  // Primary modern Clipboard API
  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return { ok: true };
    } catch (err) {
      // Fall through to legacy fallback if permission denied or restricted context
      const fallbackResult = copyWithExecCommandFallback(text);
      if (fallbackResult.ok) {
        return fallbackResult;
      }
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Clipboard permission denied',
      };
    }
  }

  // Fallback for environments without navigator.clipboard
  return copyWithExecCommandFallback(text);
}

function copyWithExecCommandFallback(text: string): CopyResult {
  if (typeof document === 'undefined' || !document.body) {
    return { ok: false, error: 'Clipboard API unavailable' };
  }

  let textarea: HTMLTextAreaElement | null = null;
  try {
    textarea = document.createElement('textarea');
    textarea.value = text;
    // Prevent scrolling and keep off-screen while preserving exact whitespace/newlines
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    const successful = typeof document.execCommand === 'function' && document.execCommand('copy');
    if (!successful) {
      return { ok: false, error: 'Copy command was rejected by browser' };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Fallback clipboard copy failed',
    };
  } finally {
    if (textarea && textarea.parentNode) {
      textarea.parentNode.removeChild(textarea);
    }
  }
}
