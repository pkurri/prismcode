import { render, screen } from '@testing-library/react';
import AchievementsPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock Separator
jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}));

describe('AchievementsPage', () => {
  it('renders page header', () => {
    render(<AchievementsPage />);
    expect(screen.getByText('Achievements')).toBeInTheDocument();
  });

  it('displays XP info', () => {
    render(<AchievementsPage />);
    expect(screen.getByText(/XP/)).toBeInTheDocument();
  });

  it('shows badges tab', () => {
    render(<AchievementsPage />);
    expect(screen.getAllByText(/Badges/i)[0]).toBeInTheDocument();
  });

  it('displays leaderboard tab', () => {
    render(<AchievementsPage />);
    expect(screen.getByText('Leaderboard')).toBeInTheDocument();
  });
});
