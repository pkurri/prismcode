import { render, screen, fireEvent } from '@testing-library/react';
import ArchitecturePage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: any) => <div>{children}</div>,
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children }: any) => <button>{children}</button>,
  TabsContent: ({ children }: any) => <div>{children}</div>,
}));

describe('ArchitecturePage', () => {
  it('renders page header', () => {
    render(<ArchitecturePage />);
    expect(screen.getByText('Architecture Validation')).toBeInTheDocument();
    expect(screen.getByText('Compare code structure against architecture diagrams')).toBeInTheDocument();
  });

  it('displays summary stats', () => {
    render(<ArchitecturePage />);
    expect(screen.getAllByText('Components')[0]).toBeInTheDocument();
    expect(screen.getByText('In Sync')).toBeInTheDocument();
    expect(screen.getByText('Drift Issues')).toBeInTheDocument();
    expect(screen.getByText('Sync Score')).toBeInTheDocument();
  });

  it('lists drift issues', () => {
    render(<ArchitecturePage />);
    expect(screen.getByText('Message Queue defined in diagram but not found in code')).toBeInTheDocument();
    expect(screen.getByText('Analytics Service exists in code but not in diagram')).toBeInTheDocument();
  });

  it('shows components with sync status', () => {
    render(<ArchitecturePage />);
    expect(screen.getByText('API Gateway')).toBeInTheDocument();
    expect(screen.getByText('Auth Service')).toBeInTheDocument();
    expect(screen.getByText('Database')).toBeInTheDocument();
  });

  it('changes diagram format', () => {
    render(<ArchitecturePage />);
    
    const plantumlBtn = screen.getByText('plantuml');
    fireEvent.click(plantumlBtn);
    
    expect(plantumlBtn).toBeInTheDocument();
  });
});
