import { render, screen } from '@testing-library/react';
import DeploymentsDashboardPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('DeploymentsDashboardPage', () => {
  it('renders page header', () => {
    render(<DeploymentsDashboardPage />);
    expect(screen.getByRole('heading', { name: /Deployments/i })).toBeInTheDocument();
  });

  it('displays environment cards', () => {
    render(<DeploymentsDashboardPage />);
    expect(screen.getAllByText('Production')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Staging')[0]).toBeInTheDocument();
  });

  it('shows environment types', () => {
    render(<DeploymentsDashboardPage />);
    expect(screen.getAllByText('production')[0]).toBeInTheDocument();
    expect(screen.getAllByText('staging')[0]).toBeInTheDocument();
  });

  it('displays deployment history', () => {
    render(<DeploymentsDashboardPage />);
    expect(screen.getByText(/Fix: navigation bug/)).toBeInTheDocument();
  });

  it('shows deployment settings', () => {
    render(<DeploymentsDashboardPage />);
    expect(screen.getByText('Auto Deploy')).toBeInTheDocument();
    expect(screen.getByText('Preview PRs')).toBeInTheDocument();
  });
});
