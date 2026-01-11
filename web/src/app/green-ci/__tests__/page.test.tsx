import { render, screen } from '@testing-library/react';
import GreenCIPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('GreenCIPage', () => {
  it('renders page header', () => {
    render(<GreenCIPage />);
    expect(screen.getByText('Green CI/CD')).toBeInTheDocument();
  });

  it('shows carbon savings badge', () => {
    render(<GreenCIPage />);
    expect(screen.getByText(/CO₂ saved today/)).toBeInTheDocument();
  });

  it('displays carbon intensity section', () => {
    render(<GreenCIPage />);
    expect(screen.getByText('Grid Carbon Intensity')).toBeInTheDocument();
  });

  it('shows scheduled runs tab', () => {
    render(<GreenCIPage />);
    expect(screen.getByText('Scheduled Runs')).toBeInTheDocument();
  });

  it('displays optimizations tab', () => {
    render(<GreenCIPage />);
    expect(screen.getByText('Optimizations')).toBeInTheDocument();
  });
});
