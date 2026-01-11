import { render, screen } from '@testing-library/react';
import AutoPRPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('AutoPRPage', () => {
  it('renders page header', () => {
    render(<AutoPRPage />);
    expect(screen.getByText('Auto-Fix PRs')).toBeInTheDocument();
  });

  it('shows scan button', () => {
    render(<AutoPRPage />);
    expect(screen.getByText('🔍 Scan for Issues')).toBeInTheDocument();
  });

  it('displays stats', () => {
    render(<AutoPRPage />);
    expect(screen.getByText('Total PRs')).toBeInTheDocument();
    expect(screen.getByText('Merged')).toBeInTheDocument();
  });

  it('shows tabs', () => {
    render(<AutoPRPage />);
    expect(screen.getAllByText(/Pull Requests/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Vulnerabilities/i)[0]).toBeInTheDocument();
  });
});
