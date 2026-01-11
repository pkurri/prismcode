import { render, screen } from '@testing-library/react';
import KeyboardShortcutsPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('KeyboardShortcutsPage', () => {
  it('renders page header', () => {
    render(<KeyboardShortcutsPage />);
    expect(screen.getByRole('heading', { name: /Keyboard Shortcuts/i })).toBeInTheDocument();
  });

  it('displays shortcuts list', () => {
    render(<KeyboardShortcutsPage />);
    expect(screen.getByText('Open Command Palette')).toBeInTheDocument();
    expect(screen.getByText('Save File')).toBeInTheDocument();
  });

  it('shows category filters', () => {
    render(<KeyboardShortcutsPage />);
    expect(screen.getAllByText('All')[0]).toBeInTheDocument();
    expect(screen.getAllByText('General')[0]).toBeInTheDocument();
  });
});
