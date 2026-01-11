import { render, screen } from '@testing-library/react';
import QualityDashboardPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: any) => <div>{children}</div>,
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children }: any) => <button>{children}</button>,
  TabsContent: ({ children }: any) => <div>{children}</div>,
}));

// Mock Separator
jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}));

describe('QualityDashboardPage', () => {
  it('renders page header', () => {
    render(<QualityDashboardPage />);
    expect(screen.getByText('Quality Intelligence')).toBeInTheDocument();
  });

  it('displays quality stats', () => {
    render(<QualityDashboardPage />);
    expect(screen.getByText('Quality Rating')).toBeInTheDocument();
    expect(screen.getByText('Test Stability')).toBeInTheDocument();
    expect(screen.getByText('Security Score')).toBeInTheDocument();
    expect(screen.getByText('Tech Debt')).toBeInTheDocument();
  });

  it('shows code reviews', () => {
    render(<QualityDashboardPage />);
    expect(screen.getByText('#342 Auth Flow')).toBeInTheDocument();
    expect(screen.getByText('#341 API Optimization')).toBeInTheDocument();
  });

  it('displays problematic hotspots', () => {
    render(<QualityDashboardPage />);
    expect(screen.getByText('Problematic Hotspots')).toBeInTheDocument();
    expect(screen.getByText('src/core/Authentication.ts')).toBeInTheDocument();
  });

  it('shows action buttons', () => {
    render(<QualityDashboardPage />);
    expect(screen.getByText('Export Report')).toBeInTheDocument();
    expect(screen.getByText('Run Analysis')).toBeInTheDocument();
  });
});
