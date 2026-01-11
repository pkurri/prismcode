import { render, screen } from '@testing-library/react';
import LeaderboardsPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('LeaderboardsPage', () => {
  it('renders page header', () => {
    render(<LeaderboardsPage />);
    expect(screen.getByRole('heading', { name: /Leaderboards/i })).toBeInTheDocument();
  });

  it('displays rankings', () => {
    render(<LeaderboardsPage />);
    expect(screen.getByText(/Team Rankings/i)).toBeInTheDocument();
  });
});
