import { render, screen } from '@testing-library/react';
import SustainabilityPage from '../page';

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

describe('SustainabilityPage', () => {
  it('renders the page header', () => {
    render(<SustainabilityPage />);
    expect(screen.getByText('Sustainability Dashboard')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<SustainabilityPage />);
    expect(screen.getByText("Track and reduce your code's carbon footprint")).toBeInTheDocument();
  });

  it('renders the Optimize All button', () => {
    render(<SustainabilityPage />);
    expect(screen.getByText('Optimize All')).toBeInTheDocument();
  });

  it('renders carbon saved stat', () => {
    render(<SustainabilityPage />);
    expect(screen.getByText('Carbon Saved')).toBeInTheDocument();
    expect(screen.getByText('12.4kg')).toBeInTheDocument();
  });

  it('renders optimized pipelines stat', () => {
    render(<SustainabilityPage />);
    expect(screen.getByText('Optimized Pipelines')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('renders energy reduced stat', () => {
    render(<SustainabilityPage />);
    expect(screen.getByText('Energy Reduced')).toBeInTheDocument();
    expect(screen.getByText('23%')).toBeInTheDocument();
  });

  it('renders trees equivalent stat', () => {
    render(<SustainabilityPage />);
    expect(screen.getByText('Trees Equivalent')).toBeInTheDocument();
  });

  it('renders pipeline emissions section', () => {
    render(<SustainabilityPage />);
    expect(screen.getByText('Pipeline Emissions')).toBeInTheDocument();
    expect(screen.getByText('Carbon footprint by CI/CD pipeline')).toBeInTheDocument();
  });

  it('renders pipeline names', () => {
    render(<SustainabilityPage />);
    expect(screen.getByText('main-build')).toBeInTheDocument();
    expect(screen.getByText('test-suite')).toBeInTheDocument();
    expect(screen.getByText('deploy-prod')).toBeInTheDocument();
  });

  it('renders optimization suggestions', () => {
    render(<SustainabilityPage />);
    expect(screen.getByText('Optimization Suggestions')).toBeInTheDocument();
    expect(screen.getByText('Move test-suite to eu-north-1')).toBeInTheDocument();
  });
});
