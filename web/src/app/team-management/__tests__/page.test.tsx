import { render, screen } from '@testing-library/react';
import TeamManagementPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('TeamManagementPage', () => {
  it('renders page header', () => {
    render(<TeamManagementPage />);
    expect(screen.getByRole('heading', { name: /Team Management/i })).toBeInTheDocument();
  });

  it('displays summary stats', () => {
    render(<TeamManagementPage />);
    expect(screen.getByText('Team Size')).toBeInTheDocument();
    expect(screen.getByText('Total Commits')).toBeInTheDocument();
  });

  it('lists team members', () => {
    render(<TeamManagementPage />);
    expect(screen.getAllByText(/Sarah Chen/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Alex Thompson/i)[0]).toBeInTheDocument();
  });

  it('shows invite member form', () => {
    render(<TeamManagementPage />);
    expect(screen.getByText('Email Address')).toBeInTheDocument();
    expect(screen.getByText('Send Invitation')).toBeInTheDocument();
  });
});
