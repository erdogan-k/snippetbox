# SnippetBox — Local-First Snippet & Template Manager

**SnippetBox** is a fast, open-source, local-first personal library for reusable text, code snippets, message templates, CLI commands, and frequently copied reference notes. It runs 100% in your browser using IndexedDB—with zero backend requirements, no user accounts, no tracking, and full offline persistence.

---

## Features

- **100% Local-First Persistence:** Powered by IndexedDB (`idb`). Your snippets, custom categories, usage history, and interface preferences survive page reloads and stay on your device.
- **Dynamic Template Engine:** Use `{{variable_name}}` placeholders inside any template. SnippetBox automatically discovers unique variables, generates interactive fill-in fields (single-line or multiline), highlights unfilled placeholders visibly, preserves your original template, and copies the live-rendered output in one click.
- **One-Click Copy & Usage Tracking:** Copy exact code or text (preserving indentation and line breaks) via the modern Clipboard API with an automatic fallback. Tracks usage count and last-used timestamps.
- **Instant Search & Combined Filters:** Case-insensitive instant search across title, content, description, tags, source URL, and category. Combine category filters, content-type filters (`text`, `code`, `template`, `link`), tag filters, favorites toggle, and multi-field sorting (`Last Updated`, `Created Date`, `Title`, `Most Used`).
- **Categories & Tag Management:** Includes 7 built-in categories (`General`, `Work`, `Personal`, `Programming`, `Email`, `Commands`, `Forms`) plus custom category creation, renaming, and safe deletion (automatically moving affected snippets to `General`).
- **Keyboard Shortcuts & Command Palette:**
  - `/`: Focus search bar when not typing in an input
  - `Ctrl/Cmd + K`: Open the interactive Command Palette (search, open, or copy snippets; trigger actions; switch sections)
  - `Ctrl/Cmd + N`: Create a new snippet
  - `Ctrl/Cmd + Enter`: Save snippet inside the editor
  - `Esc`: Close the active dialog or Command Palette
- **Trash & Safe Recovery:** Soft-delete snippets to Trash, restore them with preserved favorite/category states, or permanently delete items after explicit confirmation.
- **Versioned Backup Import & Export:**
  - Full library export/import via versioned JSON (`schemaVersion: 1`) with strict runtime schema validation, item count preview, duplicate ID resolution, and **Merge** vs. **Replace** modes.
  - Individual snippet export as `.txt`, `.md`, or language-appropriate code file extensions (`.ts`, `.py`, `.sh`, `.sql`, etc.).
  - Direct import of plain-text/code files into new snippets.
- **Bilingual Localization (EN / TR):** Centralized localization system supporting **English** and **Turkish** across all views, modals, tooltips, validation messages, and empty states.
- **Developer-Friendly Dark & Light Themes:** Dark theme by default with Light and System theme support, responsive desktop sidebar + mobile drawer, and reduced-motion accessibility.

---



## Installation & Development

### Prerequisites

- **Node.js** `>= 18.0.0` (Node 20+ recommended)
- **npm** `>= 9.0.0`

### Local Setup

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd snippetbox

# 2. Install dependencies
npm install

# 3. Start the Vite development server
npm run dev
```

### Running Tests

Automated unit and integration tests are written with **Vitest** and `fake-indexeddb`:

```bash
npm test
```

### Building for Production

```bash
npm run build
npm run preview
```

The production static bundle is generated in the `dist/` directory.

---

## GitHub Pages Deployment

SnippetBox includes a ready-to-use GitHub Actions workflow at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) that automatically:

1. Installs dependencies (`npm ci`)
2. Runs the unit test suite (`npm test`)
3. Configures the dynamic repository base path and builds the production bundle (`npm run build`)
4. Deploys the static `dist/` artifact to GitHub Pages

### How the Vite Base Path Is Configured

- By default, [`vite.config.ts`](vite.config.ts) sets `base: process.env.VITE_BASE_PATH || './'`.
- Using `'./'` (relative base path) allows the built static bundle to work out-of-the-box whether hosted at a root domain (`https://username.github.io/`) or a repository subpath (`https://username.github.io/my-custom-repo-name/`).
- In GitHub Actions, `actions/configure-pages@v5` automatically detects your exact repository name and injects `VITE_BASE_PATH: ${{ steps.pages.outputs.base_path }}/` during `npm run build`—so you never need to hardcode `SnippetBox` or edit configuration files when forking or renaming the repository.

### Enabling GitHub Pages in Your Repository

1. Push this repository to GitHub (`main` or `master` branch).
2. Go to **Settings → Pages** in your GitHub repository.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. Push a commit to `main` or trigger the **Deploy to GitHub Pages** workflow manually from the **Actions** tab.

---

## Architecture Overview

```text
snippetbox/
├── .github/workflows/deploy.yml   # Automated test, build & GitHub Pages deployment
├── public/favicon.svg             # Application icon
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx                 # Desktop sidebar & mobile drawer navigation
│   │   ├── SnippetCard.tsx             # Card & compact list row views with one-click copy
│   │   ├── SnippetEditorModal.tsx      # Create/edit dialog with validation & code support
│   │   ├── TemplateWorkbenchModal.tsx  # Dynamic {{variable}} form & live preview renderer
│   │   ├── CategoryManagerModal.tsx    # Create, rename & safely delete categories
│   │   ├── CommandPaletteModal.tsx     # Ctrl/Cmd + K keyboard command palette
│   │   ├── SettingsView.tsx            # Theme, i18n, JSON backup import/export & privacy
│   │   └── ConfirmDialog.tsx           # Accessible confirmation dialog for destructive ops
│   ├── data/
│   │   └── sampleSnippets.ts           # Optional clearly labeled demo snippets
│   ├── i18n/
│   │   └── translations.ts             # Centralized English (en) & Turkish (tr) dictionary
│   ├── services/
│   │   └── db.ts                       # IndexedDB (idb) persistence, CRUD, trash & import/export
│   ├── types/
│   │   └── snippet.ts                  # Strict TypeScript interfaces & schema constants
│   ├── utils/
│   │   ├── clipboard.ts                # Clipboard API with execCommand textarea fallback
│   │   ├── fileExport.ts               # Individual .txt/.md/code export & file import parser
│   │   ├── searchAndFilter.ts          # Instant search, combined filters & sorting engine
│   │   ├── templateEngine.ts           # Safe {{variable}} parser & literal renderer
│   │   └── validation.ts               # Runtime input & JSON backup schema validation
│   ├── test/
│   │   ├── setup.ts                    # Vitest + fake-indexeddb setup
│   │   └── snippetbox.test.ts          # Unit & integration test suite
│   ├── App.tsx                         # Main application state & keyboard shortcut controller
│   ├── main.tsx                        # React DOM entry point
│   └── index.css                       # Tailwind CSS & reduced-motion accessibility rules
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Data Privacy & Security Notice

- **Zero External Requests:** SnippetBox has no backend server, no telemetry, no analytics, and no third-party API calls. All snippets, categories, and settings remain strictly inside your browser's local IndexedDB database.
- **No Automatic Cloud Sync:** Because data lives locally in your browser profile, it is not automatically synchronized across different devices or browsers. Use **Settings → Export JSON Backup** and **Import JSON Backup** to transfer your library between machines.
- **Not a Password Manager:** Browser storage (`IndexedDB`) is **not encrypted at rest** by the browser. Do not use SnippetBox as a password vault or to store highly sensitive credentials, private keys, or secret tokens.

---

## Known Limitations

- **Browser Storage Eviction:** Clearing your browser's site data for the hosted domain will erase local IndexedDB storage unless you have exported a `.json` backup.
- **Cross-Device Sync:** Requires manual JSON export/import as there is intentionally no cloud backend.
- **Global OS-Wide Hotkeys:** Because SnippetBox is a standard web application running inside a browser tab, keyboard shortcuts (`/`, `Ctrl/Cmd + K`, `Ctrl/Cmd + N`) operate while the SnippetBox tab is focused.

---

## License

Released under the [MIT License](LICENSE).
