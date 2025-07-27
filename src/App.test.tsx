import { render } from '@testing-library/react';
import { test, vi } from 'vitest';

import App from './App';

// Mock the smart-widget-handler to prevent errors in test environment
vi.mock('smart-widget-handler', () => ({
  default: {
    client: {
      ready: vi.fn(),
      listen: vi.fn(() => ({
        close: vi.fn()
      }))
    }
  }
}));

test('App', () => {
  render(<App />);
})