import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import { clearAllData, ensureInitialCategories } from '../services/db';

beforeEach(async () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  await clearAllData();
  await ensureInitialCategories();
});

describe('4. Core User Interface & Localization Flows', () => {
  it('renders onboarding empty state with "Create my first snippet" and "Load sample snippets" without auto-inserting demo data', async () => {
    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByText('Your personal snippet library is empty')
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Create my first snippet')).toBeInTheDocument();
    expect(screen.getByText('Load sample snippets')).toBeInTheDocument();
  });

  it('loads sample snippets on user click, filters via search, and switches language to Turkish', async () => {
    render(<App />);

    const loadSamplesBtn = await screen.findByText('Load sample snippets');
    fireEvent.click(loadSamplesBtn);

    // Wait for the 5 demo snippets to appear
    await waitFor(() => {
      expect(
        screen.getByText('[Demo] Customer Support — Issue Resolution Email')
      ).toBeInTheDocument();
    });

    // Instant search filtering
    const searchInput = screen.getByPlaceholderText(
      /Search title, content, tags, or category/i
    );
    fireEvent.change(searchInput, { target: { value: 'Fetch Wrapper' } });

    expect(
      screen.getByText('[Demo] Safe Fetch Wrapper with Timeout (TypeScript)')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('[Demo] Customer Support — Issue Resolution Email')
    ).not.toBeInTheDocument();

    // Switch interface language to Turkish
    const langBtn = screen.getByTitle('Interface Language');
    fireEvent.click(langBtn);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/Başlık, içerik, etiket veya kategori ara/i)
      ).toBeInTheDocument();
    });
  });
});
