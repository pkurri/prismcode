import { render, screen, fireEvent } from '@testing-library/react';
import InfrastructurePage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: any) => <div>{children}</div>,
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children }: any) => <button>{children}</button>,
  TabsContent: ({ children }: any) => <div>{children}</div>,
}));

describe('InfrastructurePage', () => {
  it('renders page header', () => {
    render(<InfrastructurePage />);
    expect(screen.getByText('Infrastructure')).toBeInTheDocument();
    expect(screen.getByText('Manage your cloud resources')).toBeInTheDocument();
  });

  it('displays summary stats', () => {
    render(<InfrastructurePage />);
    expect(screen.getByText('Total Resources')).toBeInTheDocument();
    expect(screen.getByText('Monthly Cost')).toBeInTheDocument();
  });

  it('lists resources', () => {
    render(<InfrastructurePage />);
    expect(screen.getByText('api-server')).toBeInTheDocument();
    expect(screen.getByText('postgres-main')).toBeInTheDocument();
    expect(screen.getByText('redis-cache')).toBeInTheDocument();
  });

  it('shows resource types', () => {
    render(<InfrastructurePage />);
    expect(screen.getByText('container')).toBeInTheDocument();
    expect(screen.getByText('database')).toBeInTheDocument();
    expect(screen.getByText('cache')).toBeInTheDocument();
  });

  it('opens provision modal', () => {
    render(<InfrastructurePage />);
    
    const provisionBtn = screen.getByText('+ Provision Resource');
    fireEvent.click(provisionBtn);
    
    expect(screen.getByText('Provision New Resource')).toBeInTheDocument();
  });
});
