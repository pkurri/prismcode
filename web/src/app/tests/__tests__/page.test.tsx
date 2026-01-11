import { render, screen } from '@testing-library/react';
import TestsPage from '../page';

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
}));

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
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

describe('TestsPage', () => {
  it('renders the page header', () => {
    render(<TestsPage />);
    expect(screen.getByRole('heading', { name: 'Test Intelligence' })).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<TestsPage />);
    expect(screen.getByText('AI-powered test analysis and generation')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<TestsPage />);
    expect(screen.getByText('Generate Tests')).toBeInTheDocument();
    expect(screen.getByText('Run All Tests')).toBeInTheDocument();
  });

  it('renders total tests stat', () => {
    render(<TestsPage />);
    expect(screen.getByText('Total Tests')).toBeInTheDocument();
  });

  it('renders pass rate', () => {
    render(<TestsPage />);
    expect(screen.getByText('Pass Rate')).toBeInTheDocument();
  });

  it('renders coverage stat', () => {
    render(<TestsPage />);
    expect(screen.getAllByText(/Coverage/i)[0]).toBeInTheDocument();
  });

  it('renders tab triggers', () => {
    render(<TestsPage />);
    expect(screen.getByTestId('tab-suites')).toBeInTheDocument();
    expect(screen.getByTestId('tab-runs')).toBeInTheDocument();
    expect(screen.getByTestId('tab-flaky')).toBeInTheDocument();
  });

  it('renders test suite names', () => {
    render(<TestsPage />);
    expect(screen.getAllByText('Unit Tests')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Integration Tests')[0]).toBeInTheDocument();
    expect(screen.getAllByText('E2E Tests')[0]).toBeInTheDocument();
  });
});
