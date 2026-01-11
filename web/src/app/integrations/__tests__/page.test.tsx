import { render, screen } from '@testing-library/react';
import IntegrationsPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('IntegrationsPage', () => {
  it('renders page header', () => {
    render(<IntegrationsPage />);
    expect(screen.getByRole('heading', { name: /Integrations/i })).toBeInTheDocument();
  });

  it('lists integration options', () => {
    render(<IntegrationsPage />);
    expect(screen.getAllByText(/GitHub/i)[0]).toBeInTheDocument();
  });

  it('shows status indicators', () => {
    render(<IntegrationsPage />);
    expect(screen.getAllByText(/Connected/i)[0]).toBeInTheDocument();
  });
});
