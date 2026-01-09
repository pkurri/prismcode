import { render, screen } from '@testing-library/react';
import ModelsPage from '../page';

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
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}));

describe('ModelsPage', () => {
  it('renders the page header', () => {
    render(<ModelsPage />);
    expect(screen.getByRole('heading', { name: 'AI Models' })).toBeInTheDocument();
  });

  it('renders model names', () => {
    render(<ModelsPage />);
    // Models appear in multiple places, use getAllByText
    expect(screen.getAllByText('GPT-4o').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Claude 3.5 Sonnet').length).toBeGreaterThan(0);
  });

  it('renders model configuration sections', () => {
    render(<ModelsPage />);
    expect(screen.getByText('Available Models')).toBeInTheDocument();
    expect(screen.getByText('Per-Task Defaults')).toBeInTheDocument();
  });

  it('renders routing policy tabs', () => {
    render(<ModelsPage />);
    // Cost appears in multiple places (tab + column)
    const costElements = screen.getAllByText('Cost');
    expect(costElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Balanced')).toBeInTheDocument();
    const qualityElements = screen.getAllByText('Quality');
    expect(qualityElements.length).toBeGreaterThan(0);
  });

  it('renders usage stats', () => {
    render(<ModelsPage />);
    expect(screen.getByText('Usage This Month')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('renders add model button', () => {
    render(<ModelsPage />);
    expect(screen.getByText('Add Custom Model')).toBeInTheDocument();
  });
});
