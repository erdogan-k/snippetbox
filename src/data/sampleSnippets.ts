import { SnippetInput } from '../types/snippet';

/**
 * Optional sample dataset clearly marked with isDemo: true.
 * Covers all 5 required demo items:
 * 1. A reusable email response
 * 2. A programming snippet
 * 3. A shell command
 * 4. A meeting follow-up template
 * 5. A frequently used text block
 */
export const SAMPLE_SNIPPETS: SnippetInput[] = [
  {
    title: '[Demo] Customer Support — Issue Resolution Email',
    description: 'Reusable email response for confirming a resolved customer ticket with dynamic fields.',
    type: 'template',
    category: 'Email',
    tags: ['demo', 'support', 'email', 'customer'],
    isFavorite: true,
    isDemo: true,
    content: `Hello {{customer_name}},

Thank you for your patience while we investigated ticket #{{ticket_id}}.

We have resolved the issue affecting {{affected_feature}}. Everything should now be working as expected on your account. Please refresh your session and let us know if you need any further assistance.

Best regards,
{{agent_name}}`,
  },
  {
    title: '[Demo] Safe Fetch Wrapper with Timeout (TypeScript)',
    description: 'Reusable async fetch utility with AbortController timeout and typed JSON parsing.',
    type: 'code',
    language: 'typescript',
    category: 'Programming',
    tags: ['demo', 'typescript', 'fetch', 'async'],
    isFavorite: true,
    isDemo: true,
    content: `export async function fetchWithTimeout<T>(
  url: string,
  options: RequestInit = {},
  timeoutMs = 8000
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    }
    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}`,
  },
  {
    title: '[Demo] Find & Kill Process Listening on a Port',
    description: 'Cross-reference shell command to inspect and free a local development port.',
    type: 'code',
    language: 'bash',
    category: 'Commands',
    tags: ['demo', 'cli', 'port', 'debugging'],
    isFavorite: false,
    isDemo: true,
    content: `# Find process ID listening on port 3000 (macOS / Linux)
lsof -nP -iTCP:3000 -sTCP:LISTEN

# Terminate process gracefully by PID
kill -15 <PID>`,
  },
  {
    title: '[Demo] Post-Meeting Follow-Up & Action Items',
    description: 'Dynamic template for summarizing decisions and action items right after a team call.',
    type: 'template',
    category: 'Work',
    tags: ['demo', 'meeting', 'notes', 'template'],
    isFavorite: true,
    isDemo: true,
    content: `Hi {{team_or_recipient}},

Thanks for joining today's sync on {{project_name}}. Here is a quick summary of what we agreed on:

Key Decisions:
{{key_decisions}}

Next Steps & Owners:
- {{primary_action_item}} (Owner: {{action_owner}}, Due: {{due_date}})

Please reply if anything needs adjustment.`,
  },
  {
    title: '[Demo] Standard Pull Request Review Checklist',
    description: 'Frequently pasted markdown checklist for code reviews and release verification.',
    type: 'text',
    category: 'Forms',
    tags: ['demo', 'checklist', 'git', 'review'],
    isFavorite: false,
    isDemo: true,
    content: `### Review Verification Checklist
- [x] Core logic is covered by automated unit tests
- [x] Edge cases and error states are handled gracefully
- [x] Keyboard accessibility and focus states verified
- [x] No sensitive credentials or external tracking introduced`,
  },
];
