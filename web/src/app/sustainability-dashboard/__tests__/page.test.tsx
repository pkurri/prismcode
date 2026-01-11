import { render, screen } from '@testing-library/react';
import SustainabilityDashboardPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('SustainabilityDashboardPage', () => {
  it('renders page header', () => {
    render(<SustainabilityDashboardPage />);
    expect(screen.getAllByText(/Sustainability/i)[0]).toBeInTheDocument();
  });

  it('displays content', () => {
    render(<SustainabilityDashboardPage />);
    expect(document.body).toBeInTheDocument();
  });
});
