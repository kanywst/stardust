import { render, screen } from '@testing-library/react';
import App from './App';
import { describe, it, expect } from 'vitest';

describe('App', () => {
  it('renders the Stardust title in header', () => {
    render(<App />);
    const title = screen.getByRole('heading', { name: /Stardust/i, level: 1 });
    expect(title).toBeInTheDocument();
  });

  it('renders the main description', () => {
    render(<App />);
    expect(screen.getByText(/Navigating the brightest stars/i)).toBeInTheDocument();
  });

  it('renders repo cards from the mocked GitHub search response', async () => {
    render(<App />);
    const cards = await screen.findAllByText(/repo-1/, undefined, { timeout: 3000 });
    expect(cards.length).toBeGreaterThan(0);
  });
});
