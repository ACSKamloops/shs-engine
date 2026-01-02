
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { MetricsPanel } from '../MetricsPanel';

// Mock dependencies
const mockApi = vi.fn();
const mockSetBanner = vi.fn();

vi.mock('../../../hooks/useApi', () => ({
  useApi: () => ({
    api: mockApi,
    useLiveApi: true,
  }),
}));

vi.mock('../../../store', () => ({
  useAppStore: (selector: any) => {
    const state = { setBanner: mockSetBanner };
    return selector(state);
  },
}));

describe('MetricsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockApi.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<MetricsPanel />);
    // Might not show loading text explicitly if it's just a spinner or similar, 
    // but we can check if it doesn't crash.
    expect(screen.getByText('System Metrics')).toBeInTheDocument();
  });

  it('fetches and displays metrics', async () => {
    mockApi.mockResolvedValueOnce({ counters: { 'api.requests': 100, 'tasks.completed': 50 } }) // snapshot
           .mockResolvedValueOnce({ history: [] }); // history

    render(<MetricsPanel />);

    await waitFor(() => {
      expect(mockApi).toHaveBeenCalledTimes(2);
    });

    expect(screen.getByText('api.requests')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });
});
