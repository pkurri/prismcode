import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CodeReviewAssistant } from '../code-review-assistant';

// Mock global fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      findings: [
        {
          id: '1',
          severity: 'critical',
          category: 'security',
          title: 'SQL Injection',
          description: 'Avoid raw SQL queries',
          file: 'db/query.ts',
          lineStart: 42,
        },
      ],
      overallScore: 85,
    }),
  })
) as jest.Mock;

describe('CodeReviewAssistant', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders empty state initially', () => {
    render(<CodeReviewAssistant />);
    expect(screen.getByText(/AI Review/)).toBeInTheDocument();
    expect(screen.getByText('Select a file to analyze.')).toBeInTheDocument();
  });

  it('runs analysis when diff is provided', async () => {
    render(<CodeReviewAssistant diff="console.log('test')" />);
    
    expect(screen.getByText('Analyzing...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('SQL Injection')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Score: 85')).toBeInTheDocument();
  });

  it('allows manual re-run', async () => {
    render(<CodeReviewAssistant prId="123" />);
    const button = screen.getByText('Re-run');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/code-review', expect.any(Object));
    });
  });
});
