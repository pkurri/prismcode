import { render, screen } from '@testing-library/react';
import IntegrationsPage from '../page';

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

jest.mock('@/components/ui/input', () => ({
  Input: ({ placeholder }: { placeholder?: string }) => <input placeholder={placeholder} />,
}));

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}));

describe('IntegrationsPage', () => {
  it('renders the page header', () => {
    render(<IntegrationsPage />);
    expect(screen.getByRole('heading', { name: 'Integrations Hub' })).toBeInTheDocument();
  });

  it('renders integration names', () => {
    render(<IntegrationsPage />);
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('GitLab')).toBeInTheDocument();
    expect(screen.getByText('Jira')).toBeInTheDocument();
    expect(screen.getByText('Linear')).toBeInTheDocument();
    expect(screen.getByText('Slack')).toBeInTheDocument();
    expect(screen.getByText('Vercel')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<IntegrationsPage />);
    expect(screen.getByPlaceholderText('Search integrations...')).toBeInTheDocument();
  });

  it('renders category filters', () => {
    render(<IntegrationsPage />);
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Version Control')).toBeInTheDocument();
  });

  it('renders connection statuses', () => {
    render(<IntegrationsPage />);
    const connected = screen.getAllByText('Connected');
    expect(connected.length).toBeGreaterThan(0);
  });
});
