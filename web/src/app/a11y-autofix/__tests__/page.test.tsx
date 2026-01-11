import { render, screen } from '@testing-library/react';
import A11yAutoFixPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('A11yAutoFixPage', () => {
  it('renders page header', () => {
    render(<A11yAutoFixPage />);
    expect(screen.getByText('AI Accessibility Fixes')).toBeInTheDocument();
  });

  it('shows generate fixes button', () => {
    render(<A11yAutoFixPage />);
    expect(screen.getByText('🤖 Generate Fixes')).toBeInTheDocument();
  });

  it('displays stats', () => {
    render(<A11yAutoFixPage />);
    expect(screen.getByText('Generated')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('shows fix tabs', () => {
    render(<A11yAutoFixPage />);
    expect(screen.getAllByText(/All Fixes/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Alt Text/i)[0]).toBeInTheDocument();
  });
});
