import { render, screen } from '@testing-library/react';
import Dashboard from '../page';

// Mock the UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h3 data-testid="card-title">{children}</h3>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="card-description">{children}</p>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button data-testid="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue }: { children: React.ReactNode; defaultValue?: string }) => (
    <div data-testid="tabs" data-default={defaultValue}>
      {children}
    </div>
  ),
  TabsList: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <button data-testid={`tab-${value}`}>{children}</button>
  ),
  TabsContent: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid={`content-${value}`}>{children}</div>
  ),
}));

describe('Dashboard', () => {
  it('renders the dashboard header', () => {
    render(<Dashboard />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders welcome message', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Welcome back!/)).toBeInTheDocument();
  });

  it('renders the Run Full Analysis button', () => {
    render(<Dashboard />);
    expect(screen.getByText('Run Full Analysis')).toBeInTheDocument();
  });

  it('renders all stat cards', () => {
    render(<Dashboard />);
    expect(screen.getByText('Code Quality Score')).toBeInTheDocument();
    expect(screen.getByText('Tests Passing')).toBeInTheDocument();
    expect(screen.getByText('Carbon Saved')).toBeInTheDocument();
    expect(screen.getByText('Issues Fixed')).toBeInTheDocument();
  });

  it('renders stat values', () => {
    render(<Dashboard />);
    expect(screen.getByText('94%')).toBeInTheDocument();
    expect(screen.getByText('847/850')).toBeInTheDocument();
    expect(screen.getByText('12.4kg')).toBeInTheDocument();
    expect(screen.getByText('156')).toBeInTheDocument();
  });

  it('renders tab triggers', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('tab-activity')).toBeInTheDocument();
    expect(screen.getByTestId('tab-insights')).toBeInTheDocument();
    expect(screen.getByTestId('tab-suggestions')).toBeInTheDocument();
  });

  it('renders recent activity section', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('content-activity')).toBeInTheDocument();
  });

  it('renders activity items', () => {
    render(<Dashboard />);
    expect(screen.getByText('Bug fix applied')).toBeInTheDocument();
    expect(screen.getByText('Tests generated')).toBeInTheDocument();
  });
});
