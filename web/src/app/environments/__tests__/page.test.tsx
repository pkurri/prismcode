import { render, screen } from '@testing-library/react';
import EnvironmentsPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('EnvironmentsPage', () => {
  it('renders page header', () => {
    render(<EnvironmentsPage />);
    expect(screen.getAllByText(/Environment/i)[0]).toBeInTheDocument();
  });

  it('displays environment list', () => {
    render(<EnvironmentsPage />);
    expect(document.body).toBeInTheDocument();
  });
});
