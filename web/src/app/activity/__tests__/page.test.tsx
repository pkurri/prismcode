import { render, screen, fireEvent } from '@testing-library/react';
import ActivityFeedPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: any) => <div>{children}</div>,
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children }: any) => <button>{children}</button>,
  TabsContent: ({ children }: any) => <div>{children}</div>,
}));

describe('ActivityFeedPage', () => {
  it('renders page header', () => {
    render(<ActivityFeedPage />);
    expect(screen.getByText('Activity Feed')).toBeInTheDocument();
    expect(screen.getByText('Real-time project activity and quick actions')).toBeInTheDocument();
  });

  it('displays stats', () => {
    render(<ActivityFeedPage />);
    expect(screen.getByText('Open PRs')).toBeInTheDocument();
    expect(screen.getByText('Active Agents')).toBeInTheDocument();
    expect(screen.getByText('Test Coverage')).toBeInTheDocument();
  });

  it('shows quick actions', () => {
    render(<ActivityFeedPage />);
    expect(screen.getByText('New PR')).toBeInTheDocument();
    expect(screen.getByText('Run Tests')).toBeInTheDocument();
    expect(screen.getByText('Deploy')).toBeInTheDocument();
    expect(screen.getByText('Start Agent')).toBeInTheDocument();
  });

  it('displays recent activity', () => {
    render(<ActivityFeedPage />);
    expect(screen.getByText('PR #343 Opened')).toBeInTheDocument();
    expect(screen.getByText('Agent Task Completed')).toBeInTheDocument();
    expect(screen.getByText('Deployment Successful')).toBeInTheDocument();
  });

  it('filters activity by type', () => {
    render(<ActivityFeedPage />);
    
    const prFilter = screen.getByRole('button', { name: 'pr' });
    fireEvent.click(prFilter);
    
    // Should still show PR activity
    expect(screen.getByText('PR #343 Opened')).toBeInTheDocument();
  });
});
