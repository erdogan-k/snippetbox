import { InterfaceLanguage } from '../types/snippet';

export type TranslationDictionary = Record<string, string>;

export const translations: Record<InterfaceLanguage, TranslationDictionary> = {
  en: {
    // App & Header
    'app.name': 'SnippetBox',
    'app.tagline': 'Local-First Snippet & Template Utility',
    'header.searchPlaceholder': 'Search title, content, tags, or category... (Press /)',
    'header.newSnippet': 'New Snippet',
    'header.newSnippetShort': 'New',
    'header.commandPalette': 'Command Palette',
    'header.openMenu': 'Open navigation menu',
    'header.closeMenu': 'Close navigation menu',
    'header.clearSearch': 'Clear search query',

    // Navigation Sections
    'nav.library': 'Library',
    'nav.all': 'All Snippets',
    'nav.favorites': 'Favorites',
    'nav.templates': 'Templates',
    'nav.code': 'Code',
    'nav.text': 'Text & Messages',
    'nav.recent': 'Recently Used',
    'nav.archived': 'Archived',
    'nav.trash': 'Trash',
    'nav.settings': 'Settings',
    'nav.categories': 'Categories',
    'nav.manageCategories': 'Manage categories',
    'nav.allCategories': 'All Categories',

    // Built-in Category Labels (display helper)
    'cat.General': 'General',
    'cat.Work': 'Work',
    'cat.Personal': 'Personal',
    'cat.Programming': 'Programming',
    'cat.Email': 'Email',
    'cat.Commands': 'Commands',
    'cat.Forms': 'Forms',

    // Snippet Types
    'type.all': 'All Types',
    'type.text': 'Text / Note',
    'type.code': 'Code',
    'type.template': 'Template',
    'type.link': 'Link / Reference',

    // Filter & Sort Bar
    'filter.category': 'Category',
    'filter.type': 'Type',
    'filter.tag': 'Tag',
    'filter.allTags': 'All Tags',
    'filter.favoritesOnly': 'Favorites only',
    'filter.sortBy': 'Sort by',
    'filter.sort.updatedAt': 'Last Updated',
    'filter.sort.createdAt': 'Created Date',
    'filter.sort.title': 'Title (A–Z)',
    'filter.sort.usageCount': 'Most Used',
    'filter.sortAsc': 'Ascending order',
    'filter.sortDesc': 'Descending order',
    'filter.resetAll': 'Reset filters',
    'filter.showingCount': '{count} items',
    'filter.layoutCards': 'Card grid view',
    'filter.layoutList': 'Compact list view',

    // Actions & Copy
    'action.copy': 'Copy',
    'action.copied': 'Copied!',
    'action.copyFailed': 'Copy failed',
    'action.copyRendered': 'Copy Rendered Output',
    'action.copyRawTemplate': 'Copy Raw Template',
    'action.useTemplate': 'Fill & Copy',
    'action.edit': 'Edit',
    'action.duplicate': 'Duplicate',
    'action.archive': 'Archive',
    'action.unarchive': 'Unarchive',
    'action.moveToTrash': 'Move to Trash',
    'action.restore': 'Restore',
    'action.deletePermanently': 'Delete Permanently',
    'action.emptyTrash': 'Empty Trash',
    'action.favorite': 'Toggle favorite',
    'action.exportFile': 'Download file',
    'action.exportMd': 'Export as .md',
    'action.exportTxt': 'Export as file',
    'action.save': 'Save Snippet',
    'action.create': 'Create Snippet',
    'action.cancel': 'Cancel',
    'action.confirm': 'Confirm',
    'action.close': 'Close',
    'action.openLink': 'Open source link',

    // Snippet Card & Detail Metadata
    'snippet.demoBadge': 'Demo',
    'snippet.usedCount': 'Used {count}x',
    'snippet.neverUsed': 'Never used',
    'snippet.lastUsed': 'Last used {time}',
    'snippet.updated': 'Updated {time}',
    'snippet.created': 'Created {time}',
    'snippet.variablesDetected': '{count} variables',
    'snippet.noTags': 'No tags',
    'snippet.detailView': 'Snippet Details',

    // Create / Edit Modal
    'editor.createTitle': 'Create New Snippet',
    'editor.editTitle': 'Edit Snippet',
    'editor.fieldTitle': 'Title',
    'editor.fieldTitlePlaceholder': 'e.g., Production SSH Tunnel or Customer Welcome Email',
    'editor.fieldType': 'Snippet Type',
    'editor.fieldCategory': 'Category',
    'editor.fieldLanguage': 'Language',
    'editor.fieldDescription': 'Description (Optional)',
    'editor.fieldDescriptionPlaceholder': 'Short note about when or how to use this snippet',
    'editor.fieldContent': 'Content',
    'editor.fieldContentPlaceholder': 'Enter reusable text, code, or template with {{variables}}...',
    'editor.fieldTags': 'Tags',
    'editor.fieldTagsPlaceholder': 'Type a tag and press Enter or comma',
    'editor.addTagButton': 'Add',
    'editor.fieldSourceUrl': 'Source / Reference URL (Optional)',
    'editor.fieldSourceUrlPlaceholder': 'https://example.com/docs',
    'editor.fieldShortcut': 'Quick Alias / Reference Key (Optional)',
    'editor.fieldShortcutPlaceholder': 'e.g., !welcome or /ssh-prod',
    'editor.markFavorite': 'Mark as Favorite',
    'editor.templateHint': 'Tip: Wrap dynamic placeholders in double curly braces like {{customer_name}} or {{order_id}}.',
    'editor.detectedVariables': 'Detected template variables:',
    'editor.invalidPlaceholders': 'Malformed placeholder syntax (will be kept as literal text):',
    'editor.shortcutSaveHint': 'Press Ctrl/Cmd + Enter to save',

    // Dynamic Template Workbench / Preview
    'template.workbenchTitle': 'Dynamic Template Renderer',
    'template.variablesHeading': 'Template Variables',
    'template.noVariables': 'This snippet has no {{variable}} placeholders. You can copy it directly.',
    'template.enterValueFor': 'Value for {{name}}',
    'template.multilineToggle': 'Toggle multiline input',
    'template.clearValues': 'Reset values',
    'template.livePreview': 'Live Rendered Output',
    'template.rawSource': 'Original Template (Preserved)',
    'template.missingWarning': 'Missing values for: {vars}. Unfilled placeholders remain visible.',
    'template.allFilled': 'All variables filled and ready to copy.',

    // Validation Messages
    'validation.titleRequired': 'Please enter a title for the snippet.',
    'validation.titleTooLong': 'Title must be 160 characters or fewer.',
    'validation.contentRequired': 'Snippet content cannot be empty.',
    'validation.invalidUrl': 'Please enter a valid http:// or https:// URL.',

    // Category Management
    'category.manageTitle': 'Manage Categories',
    'category.newPlaceholder': 'New category name...',
    'category.addButton': 'Add Category',
    'category.renameButton': 'Rename',
    'category.deleteButton': 'Delete',
    'category.saveRename': 'Save',
    'category.builtInBadge': 'Default',
    'category.deleteNote': 'Deleting a category safely moves its snippets to General.',
    'category.invalidName': 'Category name must be between 1 and 48 characters.',
    'category.duplicateName': 'A category with this name already exists.',
    'category.notFound': 'Category not found.',
    'category.cannotDeleteGeneral': 'The General category cannot be deleted.',
    'category.cannotRenameGeneral': 'The General category cannot be renamed.',
    'category.deletedMovedToast': 'Category deleted. {count} snippets moved to General.',

    // Empty States & Onboarding
    'empty.libraryTitle': 'Your personal snippet library is empty',
    'empty.librarySubtitle': 'Save reusable email responses, code blocks, CLI commands, and dynamic {{templates}} directly in your browser.',
    'empty.createFirst': 'Create my first snippet',
    'empty.loadSamples': 'Load sample snippets',
    'empty.noSearchMatchTitle': 'No matching snippets found',
    'empty.noSearchMatchSubtitle': 'No items matched your current search query or active filters.',
    'empty.trashTitle': 'Trash is empty',
    'empty.trashSubtitle': 'Items moved to trash stay here until you restore or permanently delete them.',
    'empty.favoritesTitle': 'No favorite snippets yet',
    'empty.favoritesSubtitle': 'Star your most frequently copied snippets for instant access here.',
    'empty.recentTitle': 'No recently used snippets yet',
    'empty.recentSubtitle': 'Copy any snippet and it will appear here sorted by most recent usage.',
    'empty.sectionTitle': 'No snippets in this view yet',
    'empty.sectionSubtitle': 'Create a new snippet or switch sections to see other saved items.',

    // Onboarding Quick Guide
    'onboarding.title': 'Quick Guide to SnippetBox',
    'onboarding.dismiss': 'Dismiss guide',
    'onboarding.stepSearchTitle': '1. Instant Search (/)',
    'onboarding.stepSearchDesc': 'Press / anywhere or Cmd/Ctrl + K to find any snippet by title, content, tag, or category.',
    'onboarding.stepCopyTitle': '2. One-Click Copy',
    'onboarding.stepCopyDesc': 'Click Copy on any card to place exact text or code on your clipboard and track usage counts.',
    'onboarding.stepTemplateTitle': '3. Dynamic {{Templates}}',
    'onboarding.stepTemplateDesc': 'Use {{variable_name}} inside templates to auto-generate fill-in forms with live preview.',
    'onboarding.stepPrivacyTitle': '4. 100% Local-First',
    'onboarding.stepPrivacyDesc': 'All data lives in your browser IndexedDB. Export JSON backups anytime from Settings.',

    // Command Palette
    'palette.placeholder': 'Type a command or search snippets...',
    'palette.sectionActions': 'Quick Actions',
    'palette.sectionNavigation': 'Navigation',
    'palette.sectionSnippets': 'Snippets (Enter to open, Shift+Enter to copy)',
    'palette.noResults': 'No matching commands or snippets',
    'palette.actionCreate': 'Create New Snippet',
    'palette.actionToggleTheme': 'Toggle Light / Dark Theme',
    'palette.actionExportJson': 'Export Full JSON Backup',
    'palette.actionOpenSettings': 'Open Settings & Backup',
    'palette.copyHint': 'Copy',
    'palette.openHint': 'Open',

    // Settings & Privacy & Import/Export
    'settings.title': 'Settings, Backup & Privacy',
    'settings.subtitle': 'Configure interface preferences, manage local backups, and inspect storage details.',
    'settings.appearanceHeading': 'Appearance & Localization',
    'settings.themeLabel': 'Theme Mode',
    'settings.themeDark': 'Dark',
    'settings.themeLight': 'Light',
    'settings.themeSystem': 'System',
    'settings.languageLabel': 'Interface Language',
    'settings.langEn': 'English',
    'settings.langTr': 'Türkçe (Turkish)',
    'settings.defaultViewLabel': 'Default Startup View',
    'settings.layoutModeLabel': 'Snippet Display Layout',
    'settings.layoutCards': 'Cards Grid',
    'settings.layoutList': 'Compact List',
    'settings.defaultCategoryLabel': 'Default Category for New Snippets',

    // Backup / Import / Export
    'settings.backupHeading': 'Local Backup (Import & Export)',
    'settings.backupDesc': 'Export your entire library to a versioned JSON file or import snippets from backups and plain text files.',
    'settings.exportJsonBtn': 'Export JSON Backup',
    'settings.importJsonBtn': 'Import JSON Backup',
    'settings.importTxtBtn': 'Import Text/Code File (.txt, .md, .ts, .py...)',
    'settings.loadDemoBtn': 'Load Sample Demo Snippets',
    'settings.demoAlreadyLoaded': 'Sample snippets loaded into your library.',
    'import.previewTitle': 'Confirm JSON Backup Import',
    'import.schemaVersion': 'Backup Schema Version: v{version}',
    'import.itemsDetected': '{count} valid snippets and {catCount} categories ready to import.',
    'import.modeLabel': 'Import Mode',
    'import.modeMerge': 'Merge with existing library (Safe — preserves existing snippets and resolves duplicate IDs)',
    'import.modeReplace': 'Replace entire library (Destructive — deletes current snippets before importing)',
    'import.replaceWarning': 'Warning: Replace mode will permanently overwrite all current snippets in this browser.',
    'import.confirmButton': 'Run Import',
    'import.errorInvalidJsonStructure': 'Invalid file: The selected file does not contain a valid JSON object.',
    'import.errorMissingSchemaVersion': 'Invalid backup: Missing or non-numeric schemaVersion field.',
    'import.errorUnsupportedSchemaVersion': 'Unsupported schema version ({detail}). Please update SnippetBox to import this file.',
    'import.errorMissingSnippetsArray': 'Invalid backup: Missing snippets array.',
    'import.errorMalformedRecords': 'Import stopped so no malformed records are silently discarded: {detail}',
    'import.successSummary': 'Import complete: {imported} added, {merged} merged, {reassigned} duplicate IDs safely reassigned.',

    // Danger Zone & Confirmations
    'settings.dangerHeading': 'Danger Zone',
    'settings.clearAllDesc': 'Permanently delete all snippets, custom categories, and trash from this browser.',
    'settings.clearAllBtn': 'Clear All Local Data',
    'confirm.deleteSnippetTitle': 'Permanently Delete Snippet?',
    'confirm.deleteSnippetDesc': 'This item will be permanently removed from your device and cannot be recovered.',
    'confirm.emptyTrashTitle': 'Empty Trash?',
    'confirm.emptyTrashDesc': 'All trashed items will be permanently removed. This action cannot be undone.',
    'confirm.clearAllTitle': 'Clear All Local Data?',
    'confirm.clearAllDesc': 'This will permanently erase all saved snippets and categories stored in this browser. Make sure you have exported a JSON backup first.',

    // Privacy & About
    'settings.privacyHeading': 'Privacy & Local Storage Architecture',
    'settings.privacyParagraph1': 'SnippetBox runs 100% locally in your web browser using IndexedDB. No user accounts, servers, telemetry, or third-party APIs are used.',
    'settings.privacyParagraph2': 'Because data is stored locally on your device, your snippets are not automatically synchronized across different devices or browsers. Use the JSON Export/Import tools above to move data between machines.',
    'settings.privacySecurityNotice': 'Important Security Notice: Browser storage (IndexedDB) is not encrypted at rest by the browser. Do not use SnippetBox as a password manager or to store highly sensitive secrets, private keys, or API tokens.',
    'settings.versionLabel': 'Application Version',

    // Toast & Status Notifications
    'toast.copied': 'Copied "{title}" to clipboard',
    'toast.copiedRendered': 'Copied rendered template to clipboard',
    'toast.copyError': 'Clipboard error: {error}',
    'toast.snippetCreated': 'Snippet created',
    'toast.snippetUpdated': 'Snippet updated',
    'toast.snippetDuplicated': 'Snippet duplicated',
    'toast.movedToTrash': 'Moved to Trash',
    'toast.restored': 'Snippet restored from Trash',
    'toast.deletedPermanently': 'Snippet permanently deleted',
    'toast.trashEmptied': 'Removed {count} items from Trash',
    'toast.exportedJson': 'Exported full JSON backup',
    'toast.exportedFile': 'Downloaded {filename}',
    'toast.importedTextFile': 'Imported "{title}" as new snippet',
    'toast.clearedAll': 'All local snippet data has been cleared',
    'toast.archived': 'Snippet archive status updated',
  },

  tr: {
    // App & Header
    'app.name': 'SnippetBox',
    'app.tagline': 'Yerel Öncelikli Snippet ve Şablon Yöneticisi',
    'header.searchPlaceholder': 'Başlık, içerik, etiket veya kategori ara... (/ tuşu)',
    'header.newSnippet': 'Yeni Snippet',
    'header.newSnippetShort': 'Yeni',
    'header.commandPalette': 'Komut Paleti',
    'header.openMenu': 'Gezinme menüsünü aç',
    'header.closeMenu': 'Gezinme menüsünü kapat',
    'header.clearSearch': 'Arama metnini temizle',

    // Navigation Sections
    'nav.library': 'Kütüphane',
    'nav.all': 'Tüm Snippet\'ler',
    'nav.favorites': 'Favoriler',
    'nav.templates': 'Şablonlar',
    'nav.code': 'Kod',
    'nav.text': 'Metin ve Mesajlar',
    'nav.recent': 'Son Kullanılanlar',
    'nav.archived': 'Arşivlenenler',
    'nav.trash': 'Çöp Kutusu',
    'nav.settings': 'Ayarlar',
    'nav.categories': 'Kategoriler',
    'nav.manageCategories': 'Kategorileri yönet',
    'nav.allCategories': 'Tüm Kategoriler',

    // Built-in Category Labels
    'cat.General': 'Genel',
    'cat.Work': 'İş',
    'cat.Personal': 'Kişisel',
    'cat.Programming': 'Programlama',
    'cat.Email': 'E-posta',
    'cat.Commands': 'Komutlar',
    'cat.Forms': 'Formlar',

    // Snippet Types
    'type.all': 'Tüm Türler',
    'type.text': 'Metin / Not',
    'type.code': 'Kod Parçacığı',
    'type.template': 'Dinamik Şablon',
    'type.link': 'Bağlantı / Referans',

    // Filter & Sort Bar
    'filter.category': 'Kategori',
    'filter.type': 'Tür',
    'filter.tag': 'Etiket',
    'filter.allTags': 'Tüm Etiketler',
    'filter.favoritesOnly': 'Sadece favoriler',
    'filter.sortBy': 'Sırala',
    'filter.sort.updatedAt': 'Son Güncelleme',
    'filter.sort.createdAt': 'Oluşturulma Tarihi',
    'filter.sort.title': 'Başlık (A–Z)',
    'filter.sort.usageCount': 'En Çok Kullanılan',
    'filter.sortAsc': 'Artan sıralama',
    'filter.sortDesc': 'Azalan sıralama',
    'filter.resetAll': 'Filtreleri sıfırla',
    'filter.showingCount': '{count} kayıt',
    'filter.layoutCards': 'Kart görünümü',
    'filter.layoutList': 'Liste görünümü',

    // Actions & Copy
    'action.copy': 'Kopyala',
    'action.copied': 'Kopyalandı!',
    'action.copyFailed': 'Kopyalanamadı',
    'action.copyRendered': 'Üretilen Metni Kopyala',
    'action.copyRawTemplate': 'Ham Şablonu Kopyala',
    'action.useTemplate': 'Doldur ve Kopyala',
    'action.edit': 'Düzenle',
    'action.duplicate': 'Çoğalt',
    'action.archive': 'Arşivle',
    'action.unarchive': 'Arşivden Çıkar',
    'action.moveToTrash': 'Çöp Kutusuna Taşı',
    'action.restore': 'Geri Yükle',
    'action.deletePermanently': 'Kalıcı Olarak Sil',
    'action.emptyTrash': 'Çöp Kutusunu Boşalt',
    'action.favorite': 'Favori durumunu değiştir',
    'action.exportFile': 'Dosya olarak indir',
    'action.exportMd': '.md olarak dışa aktar',
    'action.exportTxt': 'Dosya olarak dışa aktar',
    'action.save': 'Değişiklikleri Kaydet',
    'action.create': 'Snippet Oluştur',
    'action.cancel': 'İptal',
    'action.confirm': 'Onayla',
    'action.close': 'Kapat',
    'action.openLink': 'Kaynak bağlantıyı aç',

    // Snippet Card & Detail Metadata
    'snippet.demoBadge': 'Örnek Veri',
    'snippet.usedCount': '{count} kez kullanıldı',
    'snippet.neverUsed': 'Henüz kullanılmadı',
    'snippet.lastUsed': 'Son kullanım: {time}',
    'snippet.updated': 'Güncellendi: {time}',
    'snippet.created': 'Oluşturuldu: {time}',
    'snippet.variablesDetected': '{count} değişken',
    'snippet.noTags': 'Etiket yok',
    'snippet.detailView': 'Snippet Detayları',

    // Create / Edit Modal
    'editor.createTitle': 'Yeni Snippet Oluştur',
    'editor.editTitle': 'Snippet\'i Düzenle',
    'editor.fieldTitle': 'Başlık',
    'editor.fieldTitlePlaceholder': 'Örn: Sunucu SSH Komutu veya Müşteri Yanıt Şablonu',
    'editor.fieldType': 'İçerik Türü',
    'editor.fieldCategory': 'Kategori',
    'editor.fieldLanguage': 'Programlama Dili',
    'editor.fieldDescription': 'Açıklama (İsteğe bağlı)',
    'editor.fieldDescriptionPlaceholder': 'Bu içeriğin ne zaman veya nasıl kullanılacağına dair kısa not',
    'editor.fieldContent': 'İçerik',
    'editor.fieldContentPlaceholder': 'Tekrar kullanılabilir metin, kod veya {{degisken}} içeren şablon girin...',
    'editor.fieldTags': 'Etiketler',
    'editor.fieldTagsPlaceholder': 'Etiket yazıp Enter veya virgül tuşuna basın',
    'editor.addTagButton': 'Ekle',
    'editor.fieldSourceUrl': 'Kaynak URL (İsteğe bağlı)',
    'editor.fieldSourceUrlPlaceholder': 'https://ornek.com/dokuman',
    'editor.fieldShortcut': 'Kısa Kısayol Kodu / Takma Ad (İsteğe bağlı)',
    'editor.fieldShortcutPlaceholder': 'Örn: !merhaba veya /ssh-prod',
    'editor.markFavorite': 'Favorilere Ekle',
    'editor.templateHint': 'İpucu: Dinamik alanları {{musteri_adi}} veya {{siparis_no}} şeklinde çift süslü parantez içine alın.',
    'editor.detectedVariables': 'Algılanan şablon değişkenleri:',
    'editor.invalidPlaceholders': 'Geçersiz değişken sözdizimi (düz metin olarak korunur):',
    'editor.shortcutSaveHint': 'Kaydetmek için Ctrl/Cmd + Enter',

    // Dynamic Template Workbench / Preview
    'template.workbenchTitle': 'Dinamik Şablon Oluşturucu',
    'template.variablesHeading': 'Şablon Değişkenleri',
    'template.noVariables': 'Bu içerikte {{degisken}} alanı bulunmuyor. Doğrudan kopyalayabilirsiniz.',
    'template.enterValueFor': '{{name}} için değer girin',
    'template.multilineToggle': 'Çok satırlı girişi aç/kapat',
    'template.clearValues': 'Değerleri temizle',
    'template.livePreview': 'Canlı Önizleme Çıktısı',
    'template.rawSource': 'Orijinal Şablon (Korunur)',
    'template.missingWarning': 'Eksik değişkenler: {vars}. Doldurulmayan alanlar görünür kalır.',
    'template.allFilled': 'Tüm değişkenler dolduruldu ve kopyalamaya hazır.',

    // Validation Messages
    'validation.titleRequired': 'Lütfen snippet için bir başlık girin.',
    'validation.titleTooLong': 'Başlık en fazla 160 karakter olabilir.',
    'validation.contentRequired': 'Snippet içeriği boş bırakılamaz.',
    'validation.invalidUrl': 'Lütfen geçerli bir http:// veya https:// adresi girin.',

    // Category Management
    'category.manageTitle': 'Kategorileri Yönet',
    'category.newPlaceholder': 'Yeni kategori adı...',
    'category.addButton': 'Kategori Ekle',
    'category.renameButton': 'Yeniden Adlandır',
    'category.deleteButton': 'Sil',
    'category.saveRename': 'Kaydet',
    'category.builtInBadge': 'Varsayılan',
    'category.deleteNote': 'Silinen kategorideki kayıtlar silinmez, güvenli şekilde Genel kategorisine taşınır.',
    'category.invalidName': 'Kategori adı 1 ile 48 karakter arasında olmalıdır.',
    'category.duplicateName': 'Bu isimde bir kategori zaten mevcut.',
    'category.notFound': 'Kategori bulunamadı.',
    'category.cannotDeleteGeneral': 'Genel kategorisi silinemez.',
    'category.cannotRenameGeneral': 'Genel kategorisi yeniden adlandırılamaz.',
    'category.deletedMovedToast': 'Kategori silindi. {count} kayıt Genel kategorisine taşındı.',

    // Empty States & Onboarding
    'empty.libraryTitle': 'Kişisel snippet kütüphaneniz henüz boş',
    'empty.librarySubtitle': 'Sık kullandığınız e-posta şablonlarını, kod parçacıklarını, komutları ve dinamik {{şablonları}} doğrudan tarayıcınızda saklayın.',
    'empty.createFirst': 'İlk snippet\'imi oluştur',
    'empty.loadSamples': 'Örnek snippet\'leri yükle',
    'empty.noSearchMatchTitle': 'Eşleşen sonuç bulunamadı',
    'empty.noSearchMatchSubtitle': 'Mevcut arama teriminiz veya seçili filtrelerinizle eşleşen kayıt yok.',
    'empty.trashTitle': 'Çöp kutusu boş',
    'empty.trashSubtitle': 'Çöp kutusuna taşınan öğeler siz geri yükleyene veya kalıcı olarak silene kadar burada tutulur.',
    'empty.favoritesTitle': 'Henüz favori snippet yok',
    'empty.favoritesSubtitle': 'En sık kopyaladığınız içerikleri yıldızlayarak buradan anında erişebilirsiniz.',
    'empty.recentTitle': 'Henüz son kullanılan kayıt yok',
    'empty.recentSubtitle': 'Herhangi bir snippet\'i kopyaladığınızda kullanım sırasına göre burada listelenir.',
    'empty.sectionTitle': 'Bu görünümde henüz kayıt yok',
    'empty.sectionSubtitle': 'Yeni bir snippet oluşturabilir veya diğer bölümlere geçiş yapabilirsiniz.',

    // Onboarding Quick Guide
    'onboarding.title': 'SnippetBox Hızlı Başlangıç Rehberi',
    'onboarding.dismiss': 'Rehberi gizle',
    'onboarding.stepSearchTitle': '1. Anında Arama (/)',
    'onboarding.stepSearchDesc': '/ tuşuna veya Cmd/Ctrl + K kısayoluna basarak başlık, içerik, etiket ve kategorilerde anında arama yapın.',
    'onboarding.stepCopyTitle': '2. Tek Tıkla Kopyalama',
    'onboarding.stepCopyDesc': 'Her karttaki Kopyala düğmesiyle biçimlendirmeyi bozmadan panoya kopyalayın ve kullanım sayısını takip edin.',
    'onboarding.stepTemplateTitle': '3. Dinamik {{Şablonlar}}',
    'onboarding.stepTemplateDesc': '{{degisken_adi}} ifadeleri kullanarak otomatik form alanları ve canlı önizleme oluşturun.',
    'onboarding.stepPrivacyTitle': '4. %100 Yerel ve Gizli',
    'onboarding.stepPrivacyDesc': 'Tüm verileriniz tarayıcınızdaki IndexedDB\'de saklanır. Ayarlar\'dan istediğiniz zaman JSON yedeği alabilirsiniz.',

    // Command Palette
    'palette.placeholder': 'Bir komut yazın veya snippet arayın...',
    'palette.sectionActions': 'Hızlı İşlemler',
    'palette.sectionNavigation': 'Gezinme',
    'palette.sectionSnippets': 'Snippet\'ler (Açmak için Enter, kopyalamak için Shift+Enter)',
    'palette.noResults': 'Eşleşen komut veya snippet bulunamadı',
    'palette.actionCreate': 'Yeni Snippet Oluştur',
    'palette.actionToggleTheme': 'Açık / Koyu Temayı Değiştir',
    'palette.actionExportJson': 'Tam JSON Yedeğini Dışa Aktar',
    'palette.actionOpenSettings': 'Ayarlar ve Yedeklemeyi Aç',
    'palette.copyHint': 'Kopyala',
    'palette.openHint': 'Aç',

    // Settings & Privacy & Import/Export
    'settings.title': 'Ayarlar, Yedekleme ve Gizlilik',
    'settings.subtitle': 'Arayüz tercihlerini yapılandırın, yerel yedeklerinizi yönetin ve veri gizliliği bilgilerini inceleyin.',
    'settings.appearanceHeading': 'Görünüm ve Dil',
    'settings.themeLabel': 'Tema Modu',
    'settings.themeDark': 'Koyu',
    'settings.themeLight': 'Açık',
    'settings.themeSystem': 'Sistem',
    'settings.languageLabel': 'Arayüz Dili',
    'settings.langEn': 'English (İngilizce)',
    'settings.langTr': 'Türkçe',
    'settings.defaultViewLabel': 'Varsayılan Başlangıç Görünümü',
    'settings.layoutModeLabel': 'Snippet Liste Görünümü',
    'settings.layoutCards': 'Kart Izgarası',
    'settings.layoutList': 'Kompakt Liste',
    'settings.defaultCategoryLabel': 'Yeni Kayıtlar İçin Varsayılan Kategori',

    // Backup / Import / Export
    'settings.backupHeading': 'Yerel Yedekleme (İçe ve Dışa Aktarma)',
    'settings.backupDesc': 'Tüm kütüphanenizi sürüm kontrollü JSON dosyası olarak dışa aktarın veya yedek/metin dosyalarından içe aktarın.',
    'settings.exportJsonBtn': 'JSON Yedeğini Dışa Aktar',
    'settings.importJsonBtn': 'JSON Yedeğini İçe Aktar',
    'settings.importTxtBtn': 'Metin veya Kod Dosyası İçe Aktar (.txt, .md, .ts, .py...)',
    'settings.loadDemoBtn': 'Örnek (Demo) Veri Setini Yükle',
    'settings.demoAlreadyLoaded': 'Örnek snippet\'ler kütüphanenize eklendi.',
    'import.previewTitle': 'JSON Yedeği İçe Aktarma Onayı',
    'import.schemaVersion': 'Yedek Şema Sürümü: v{version}',
    'import.itemsDetected': 'İçe aktarılmaya hazır {count} geçerli snippet ve {catCount} kategori bulundu.',
    'import.modeLabel': 'İçe Aktarma Modu',
    'import.modeMerge': 'Mevcut kütüphaneyle birleştir (Güvenli — mevcut kayıtları korur ve çakışan kimlikleri çözer)',
    'import.modeReplace': 'Tüm kütüphaneyi değiştir (Yıkıcı — içe aktarmadan önce mevcut tüm kayıtları siler)',
    'import.replaceWarning': 'Uyarı: Değiştir modu bu tarayıcıdaki tüm mevcut snippet\'lerin üzerine kalıcı olarak yazacaktır.',
    'import.confirmButton': 'İçe Aktarmayı Başlat',
    'import.errorInvalidJsonStructure': 'Geçersiz dosya: Seçilen dosya geçerli bir JSON nesnesi içermiyor.',
    'import.errorMissingSchemaVersion': 'Geçersiz yedek: schemaVersion alanı eksik veya geçersiz.',
    'import.errorUnsupportedSchemaVersion': 'Desteklenmeyen şema sürümü ({detail}). Bu dosyayı içe aktarmak için uygulamayı güncelleyin.',
    'import.errorMissingSnippetsArray': 'Geçersiz yedek: snippets dizisi bulunamadı.',
    'import.errorMalformedRecords': 'Hatalı kayıtların sessizce kaybolmaması için içe aktarma durduruldu: {detail}',
    'import.successSummary': 'İçe aktarma tamamlandı: {imported} eklendi, {merged} birleştirildi, {reassigned} çakışan kimlik yeniden atandı.',

    // Danger Zone & Confirmations
    'settings.dangerHeading': 'Tehlikeli Bölge',
    'settings.clearAllDesc': 'Bu tarayıcıdaki tüm snippet\'leri, özel kategorileri ve çöp kutusunu kalıcı olarak silin.',
    'settings.clearAllBtn': 'Tüm Yerel Verileri Temizle',
    'confirm.deleteSnippetTitle': 'Snippet Kalıcı Olarak Silinsin mi?',
    'confirm.deleteSnippetDesc': 'Bu öğe cihazınızdan kalıcı olarak kaldırılacak ve geri getirilemeyecektir.',
    'confirm.emptyTrashTitle': 'Çöp Kutusu Boşaltılsın mı?',
    'confirm.emptyTrashDesc': 'Çöp kutusundaki tüm öğeler kalıcı olarak silinecektir. Bu işlem geri alınamaz.',
    'confirm.clearAllTitle': 'Tüm Yerel Veriler Silinsin mi?',
    'confirm.clearAllDesc': 'Bu işlem tarayıcıda kayıtlı tüm snippet ve kategorileri kalıcı olarak silecektir. Devam etmeden önce JSON yedeği aldığınızdan emin olun.',

    // Privacy & About
    'settings.privacyHeading': 'Gizlilik ve Yerel Depolama Mimarisi',
    'settings.privacyParagraph1': 'SnippetBox, IndexedDB kullanarak %100 yerel olarak web tarayıcınızda çalışır. Kullanıcı hesabı, sunucu, analitik takibi veya üçüncü taraf API kullanılmaz.',
    'settings.privacyParagraph2': 'Veriler yalnızca cihazınızda saklandığı için farklı cihazlar veya tarayıcılar arasında otomatik olarak eşitlenmez. Cihazlar arasında veri taşımak için yukarıdaki JSON Dışa/İçe Aktarma araçlarını kullanabilirsiniz.',
    'settings.privacySecurityNotice': 'Önemli Güvenlik Uyarısı: Tarayıcı depolama alanı (IndexedDB) tarayıcı tarafından şifrelenmez. SnippetBox bir parola yöneticisi değildir; lütfen şifrelerinizi, özel anahtarlarınızı veya yüksek gizlilik gerektiren API anahtarlarınızı burada saklamayın.',
    'settings.versionLabel': 'Uygulama Sürümü',

    // Toast & Status Notifications
    'toast.copied': '"{title}" panoya kopyalandı',
    'toast.copiedRendered': 'Üretilen şablon metni panoya kopyalandı',
    'toast.copyError': 'Pano hatası: {error}',
    'toast.snippetCreated': 'Snippet oluşturuldu',
    'toast.snippetUpdated': 'Snippet güncellendi',
    'toast.snippetDuplicated': 'Snippet çoğaltıldı',
    'toast.movedToTrash': 'Çöp kutusuna taşındı',
    'toast.restored': 'Snippet çöp kutusundan geri yüklendi',
    'toast.deletedPermanently': 'Snippet kalıcı olarak silindi',
    'toast.trashEmptied': 'Çöp kutusundan {count} öğe silindi',
    'toast.exportedJson': 'Tam JSON yedeği indirildi',
    'toast.exportedFile': '{filename} indirildi',
    'toast.importedTextFile': '"{title}" yeni snippet olarak içe aktarıldı',
    'toast.clearedAll': 'Tüm yerel veriler temizlendi',
    'toast.archived': 'Arşiv durumu güncellendi',
  },
};

export function translate(
  lang: InterfaceLanguage,
  key: string,
  params?: Record<string, string | number>
): string {
  const dict = translations[lang] || translations.en;
  let template = dict[key] ?? translations.en[key] ?? key;

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      template = template.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return template;
}

export function formatRelativeTime(timestamp: number | null, lang: InterfaceLanguage): string {
  if (!timestamp) return '';
  const diffSeconds = Math.round((timestamp - Date.now()) / 1000);
  const absSeconds = Math.abs(diffSeconds);

  try {
    const rtf = new Intl.RelativeTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-US', {
      numeric: 'auto',
    });

    if (absSeconds < 60) {
      return rtf.format(diffSeconds, 'second');
    }
    const diffMinutes = Math.round(diffSeconds / 60);
    if (Math.abs(diffMinutes) < 60) {
      return rtf.format(diffMinutes, 'minute');
    }
    const diffHours = Math.round(diffMinutes / 60);
    if (Math.abs(diffHours) < 24) {
      return rtf.format(diffHours, 'hour');
    }
    const diffDays = Math.round(diffHours / 24);
    if (Math.abs(diffDays) < 30) {
      return rtf.format(diffDays, 'day');
    }
    return new Date(timestamp).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US');
  } catch {
    return new Date(timestamp).toLocaleDateString();
  }
}
