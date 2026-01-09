import { render, screen } from '@testing-library/react';
import ReviewPage from '../page';

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}));

describe('ReviewPage', () => {
  it('renders the page header', () => {
    render(<ReviewPage />);
    expect(screen.getByRole('heading', { name: 'Code Review Assistant' })).toBeInTheDocument();
  });

  it('renders PR list section', () => {
    render(<ReviewPage />);
    expect(screen.getByText('Open Pull Requests')).toBeInTheDocument();
  });

  it('renders PR titles', () => {
    render(<ReviewPage />);
    // PR titles appear in multiple places (list + details), use getAllByText
    const authPR = screen.getAllByText('feat: Add user authentication flow');
    expect(authPR.length).toBeGreaterThan(0);
  });

  it('renders filter tabs', () => {
    render(<ReviewPage />);
    // "All", "Critical", and "Warnings" appear in multiple places
    const allButtons = screen.getAllByText('All');
    expect(allButtons.length).toBeGreaterThan(0);
    const criticalElements = screen.getAllByText('Critical');
    expect(criticalElements.length).toBeGreaterThan(0);
    const warningElements = screen.getAllByText('Warnings');
    expect(warningElements.length).toBeGreaterThan(0);
  });

  it('renders action buttons', () => {
    render(<ReviewPage />);
    expect(screen.getByText('Sync PRs')).toBeInTheDocument();
    expect(screen.getByText('Apply All Safe Fixes')).toBeInTheDocument();
  });
});
