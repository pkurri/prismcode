import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AskPage from '../page';

// Mock react-markdown to avoid ESM issues
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>,
}));

// Mock fetch for RAG API
global.fetch = jest.fn();

describe('AskPage', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders chat interface', () => {
    render(<AskPage />);
    expect(screen.getByPlaceholderText(/Ask a question/)).toBeInTheDocument();
  });

  it('renders welcome message', () => {
    render(<AskPage />);
    expect(screen.getByText(/Hello! I am your Codebase Assistant/)).toBeInTheDocument();
  });

  it('sends a query and displays response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ answer: 'Mock Answer', sources: ['file.ts'] }),
    });

    render(<AskPage />);
    const input = screen.getByPlaceholderText(/Ask a question/);
    fireEvent.change(input, { target: { value: 'How does this work?' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Mock Answer')).toBeInTheDocument();
    });
    expect(screen.getByText('file.ts')).toBeInTheDocument();
  });

  it('handles API error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

    render(<AskPage />);
    const input = screen.getByPlaceholderText(/Ask a question/);
    fireEvent.change(input, { target: { value: 'Error query' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText(/Sorry, I encountered an error/)).toBeInTheDocument();
    });
  });
});
