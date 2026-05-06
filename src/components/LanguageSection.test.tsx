import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import type { ReactElement } from 'react';
import { LanguageSection } from './LanguageSection';
import type { Language } from '../config/languages';
import { server } from '../../vitest.setup';

const language: Language = { name: 'Rust', color: '#dea584', query: 'language:rust' };

function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe('LanguageSection', () => {
  it('renders the empty state when the API returns no repositories', async () => {
    server.use(
      http.get('https://api.github.com/search/repositories', () =>
        HttpResponse.json({ total_count: 0, incomplete_results: false, items: [] })
      )
    );

    renderWithClient(<LanguageSection language={language} />);

    expect(
      await screen.findByText(/No repositories with more than 100 stars/i)
    ).toBeInTheDocument();
  });

  it('renders an error state with a retry button when the API fails', async () => {
    server.use(
      http.get('https://api.github.com/search/repositories', () =>
        HttpResponse.json({ message: 'Server Error' }, { status: 500 })
      )
    );

    renderWithClient(<LanguageSection language={language} />);

    expect(await screen.findByText(/Failed to load Rust repositories/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
});
