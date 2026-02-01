import { render, screen } from '@testing-library/react';
import App from './App';
import { describe, it, expect } from 'vitest';

describe('App', () => {
  it('renders the Stardust title in header', () => {
    render(<App />);
    // Target the h1 specifically to avoid footer conflict
    const title = screen.getByRole('heading', { name: /Stardust/i, level: 1 });
    expect(title).toBeInTheDocument();
  });

  it('renders the main description', () => {
    render(<App />);
    // Match part of the text that isn't split by spans
    expect(screen.getByText(/Navigating the brightest stars/i)).toBeInTheDocument();
  });
});
