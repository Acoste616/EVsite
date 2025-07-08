import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock console.error to avoid Firebase warnings in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Firebase')) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
  });

  test('renders loading screen initially', () => {
    render(<App />);
    expect(screen.getByText(/ładowanie/i)).toBeInTheDocument();
  });

  test('renders header with logo', () => {
    render(<App />);
    const logoImages = screen.getAllByAltText(/ev-shop/i);
    expect(logoImages.length).toBeGreaterThan(0);
  });
});
