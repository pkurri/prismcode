import { render, screen } from '@testing-library/react';
import EditorPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('EditorPage', () => {
  it('renders file tabs', () => {
    render(<EditorPage />);
    expect(screen.getAllByText('App.tsx')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Dashboard.tsx')[0]).toBeInTheDocument();
  });

  it('shows file explorer', () => {
    render(<EditorPage />);
    expect(screen.getByText('Explorer')).toBeInTheDocument();
  });

  it('shows status bar', () => {
    render(<EditorPage />);
    expect(screen.getByText(/Ln 1, Col 1/)).toBeInTheDocument();
  });

  it('displays save button', () => {
    render(<EditorPage />);
    expect(screen.getByText(/Save/)).toBeInTheDocument();
  });
});
