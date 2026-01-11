import { render, screen } from '@testing-library/react';
import DeployPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('DeployPage', () => {
  it('renders page header', () => {
    render(<DeployPage />);
    expect(screen.getByText('Deploy')).toBeInTheDocument();
  });

  it('shows deploy button', () => {
    render(<DeployPage />);
    expect(screen.getByText('🚀 Deploy to Preview')).toBeInTheDocument();
  });

  it('displays tabs', () => {
    render(<DeployPage />);
    expect(screen.getAllByText(/Deployments/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Environments/i)[0]).toBeInTheDocument();
  });

  it('shows deployment status', () => {
    render(<DeployPage />);
    expect(screen.getByText('Production')).toBeInTheDocument();
  });
});
