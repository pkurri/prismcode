import { render, screen } from '@testing-library/react';
import WorkflowsPage from '../page';

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
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

describe('WorkflowsPage', () => {
  it('renders the page header', () => {
    render(<WorkflowsPage />);
    expect(screen.getByRole('heading', { name: 'Workflow Builder' })).toBeInTheDocument();
  });

  it('renders tab navigation', () => {
    render(<WorkflowsPage />);
    expect(screen.getByText('Canvas')).toBeInTheDocument();
    expect(screen.getByText('My Workflows')).toBeInTheDocument();
    expect(screen.getByText('Run History')).toBeInTheDocument();
  });

  it('renders node palette', () => {
    render(<WorkflowsPage />);
    expect(screen.getByText('Node Palette')).toBeInTheDocument();
  });

  it('renders canvas', () => {
    render(<WorkflowsPage />);
    expect(screen.getByText('Workflow Canvas')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<WorkflowsPage />);
    expect(screen.getByText('New Workflow')).toBeInTheDocument();
    expect(screen.getByText('Import')).toBeInTheDocument();
  });

  it('renders node types', () => {
    render(<WorkflowsPage />);
    expect(screen.getByText('GitHub Event')).toBeInTheDocument();
    expect(screen.getByText('AI Analysis')).toBeInTheDocument();
  });
});
