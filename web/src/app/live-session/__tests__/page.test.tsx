import { render, screen } from '@testing-library/react';
import LiveSessionPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
});

describe('LiveSessionPage', () => {
  it('renders page header', () => {
    render(<LiveSessionPage />);
    expect(screen.getByText('Live Code Sessions')).toBeInTheDocument();
  });

  it('shows start session button', () => {
    render(<LiveSessionPage />);
    expect(screen.getByText('+ Start Session')).toBeInTheDocument();
  });

  it('displays session content', () => {
    render(<LiveSessionPage />);
    expect(screen.getAllByText(/Session/i)[0]).toBeInTheDocument();
  });
});
