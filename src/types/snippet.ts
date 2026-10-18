export type SnippetType = 'text' | 'code' | 'template' | 'link';

export type SnippetStatus = 'active' | 'archived' | 'trashed';

export interface Snippet {
  id: string;
  title: string;
  content: string;
  description?: string;
  type: SnippetType;
  category: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
  lastUsedAt: number | null;
  usageCount: number;
  language?: string;
  sourceUrl?: string;
  shortcut?: string;
  status: SnippetStatus;
  isDemo?: boolean;
}

export interface SnippetInput {
  title: string;
  content: string;
  description?: string;
  type: SnippetType;
  category: string;
  tags: string[];
  isFavorite?: boolean;
  language?: string;
  sourceUrl?: string;
  shortcut?: string;
  status?: SnippetStatus;
  isDemo?: boolean;
}

export interface CategoryItem {
  id: string;
  name: string;
  isBuiltIn?: boolean;
  createdAt: number;
}

export type ThemeMode = 'dark' | 'light' | 'system';
export type InterfaceLanguage = 'en' | 'tr';
export type LayoutMode = 'cards' | 'list';
export type NavSection =
  | 'all'
  | 'favorites'
  | 'templates'
  | 'code'
  | 'text'
  | 'recent'
  | 'archived'
  | 'trash'
  | 'settings';

export type SortField = 'updatedAt' | 'createdAt' | 'title' | 'usageCount';
export type SortDirection = 'asc' | 'desc';

export interface AppPreferences {
  theme: ThemeMode;
  language: InterfaceLanguage;
  defaultView: Exclude<NavSection, 'settings' | 'trash'>;
  layoutMode: LayoutMode;
  defaultCategory: string;
  dismissedOnboarding: boolean;
}

export interface SearchFilterCriteria {
  query: string;
  section: NavSection;
  category: string | 'ALL';
  type: SnippetType | 'ALL';
  tag: string | 'ALL';
  onlyFavorites: boolean;
  sortBy: SortField;
  sortDirection: SortDirection;
}

export const CURRENT_EXPORT_SCHEMA_VERSION = 1;

export interface ExportBundleV1 {
  appName: 'SnippetBox';
  schemaVersion: number;
  exportedAt: string;
  snippets: Snippet[];
  categories: CategoryItem[];
  preferences?: Partial<AppPreferences>;
}

export const INITIAL_CATEGORIES: string[] = [
  'General',
  'Work',
  'Personal',
  'Programming',
  'Email',
  'Commands',
  'Forms',
];

export const CODE_LANGUAGES: { value: string; label: string; ext: string }[] = [
  { value: 'typescript', label: 'TypeScript', ext: 'ts' },
  { value: 'javascript', label: 'JavaScript', ext: 'js' },
  { value: 'python', label: 'Python', ext: 'py' },
  { value: 'bash', label: 'Bash / Shell', ext: 'sh' },
  { value: 'powershell', label: 'PowerShell', ext: 'ps1' },
  { value: 'sql', label: 'SQL', ext: 'sql' },
  { value: 'json', label: 'JSON', ext: 'json' },
  { value: 'html', label: 'HTML', ext: 'html' },
  { value: 'css', label: 'CSS', ext: 'css' },
  { value: 'go', label: 'Go', ext: 'go' },
  { value: 'rust', label: 'Rust', ext: 'rs' },
  { value: 'java', label: 'Java', ext: 'java' },
  { value: 'csharp', label: 'C#', ext: 'cs' },
  { value: 'yaml', label: 'YAML', ext: 'yml' },
  { value: 'markdown', label: 'Markdown', ext: 'md' },
  { value: 'plaintext', label: 'Plain Text', ext: 'txt' },
];
