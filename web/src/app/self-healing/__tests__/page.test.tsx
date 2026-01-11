import { render, screen } from '@testing-library/react';
import SelfHealingPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('SelfHealingPage', () => {
  it('renders page header', () => {
    render(<SelfHealingPage />);
    expect(screen.getByRole('heading', { name: /Self-Healing/i })).toBeInTheDocument();
  });

  it('displays content', () => {
    render(<SelfHealingPage />);
    expect(screen.getAllByText(/Healing/i)[0]).toBeInTheDocument();
  });
});
