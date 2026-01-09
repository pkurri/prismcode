import { render, screen, fireEvent } from '@testing-library/react';
import AnalysisPage from '../page';

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs">{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <button data-testid="tabs-trigger" data-value={value}>
      {children}
    </button>
  ),
  TabsContent: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid="tabs-content" data-value={value}>
      {children}
    </div>
  ),
}));

describe('AnalysisPage', () => {
  it('renders the page header', () => {
    render(<AnalysisPage />);
    expect(screen.getByText('Code Analysis')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<AnalysisPage />);
    expect(
      screen.getByText('Deep analysis of your codebase quality and health')
    ).toBeInTheDocument();
  });

  it('renders the Run Analysis button', () => {
    render(<AnalysisPage />);
    expect(screen.getByText('Run Analysis')).toBeInTheDocument();
  });

  it('renders quality score', () => {
    render(<AnalysisPage />);
    expect(screen.getByText('Quality Score')).toBeInTheDocument();
    expect(screen.getByText('87%')).toBeInTheDocument();
  });

  it('renders error count', () => {
    render(<AnalysisPage />);
    expect(screen.getByText('Errors')).toBeInTheDocument();
  });

  it('renders warnings count', () => {
    render(<AnalysisPage />);
    expect(screen.getByText('Warnings')).toBeInTheDocument();
  });

  it('renders suggestions count', () => {
    render(<AnalysisPage />);
    expect(screen.getByText('Suggestions')).toBeInTheDocument();
  });

  it('renders tab navigation', () => {
    render(<AnalysisPage />);
    expect(screen.getByText('Issues')).toBeInTheDocument();
    expect(screen.getByText('Complexity')).toBeInTheDocument();
    expect(screen.getByText('Dependencies')).toBeInTheDocument();
  });

  it('renders detected issues', () => {
    render(<AnalysisPage />);
    expect(screen.getByText('Detected Issues')).toBeInTheDocument();
    expect(screen.getByText('Possible null reference')).toBeInTheDocument();
  });

  it('changes button text when analyzing', () => {
    render(<AnalysisPage />);
    const button = screen.getByText('Run Analysis');
    fireEvent.click(button);
    expect(screen.getByText('Analyzing...')).toBeInTheDocument();
  });
});
