import { render, screen } from '@testing-library/react';
import TestingDashboardPage from '../page';

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('TestingDashboardPage', () => {
  it('renders page header', () => {
    render(<TestingDashboardPage />);
    expect(screen.getByText('Testing & Quality Dashboard')).toBeInTheDocument();
  });
});
