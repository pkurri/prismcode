import { render, screen } from '@testing-library/react';
import TeamPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock Avatar
jest.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AvatarFallback: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

describe('TeamPage', () => {
  it('renders page header', () => {
    render(<TeamPage />);
    expect(screen.getByRole('heading', { name: /Team Management/i })).toBeInTheDocument();
  });

  it('displays content', () => {
    render(<TeamPage />);
    expect(screen.getAllByText(/Team/i)[0]).toBeInTheDocument();
  });
});
