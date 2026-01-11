import { render, screen } from '@testing-library/react';
import CodeReviewPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('CodeReviewPage', () => {
  it('renders page header', () => {
    render(<CodeReviewPage />);
    expect(screen.getAllByText(/Code Review/i)[0]).toBeInTheDocument();
  });

  it('displays reviews', () => {
    render(<CodeReviewPage />);
    expect(screen.getAllByText(/Review/i)[0]).toBeInTheDocument();
  });
});
