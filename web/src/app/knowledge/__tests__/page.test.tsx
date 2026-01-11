import { render, screen, fireEvent } from '@testing-library/react';
import KnowledgeGraphPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: any) => <div>{children}</div>,
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children }: any) => <button>{children}</button>,
  TabsContent: ({ children }: any) => <div>{children}</div>,
}));

describe('KnowledgeGraphPage', () => {
  it('renders page header', () => {
    render(<KnowledgeGraphPage />);
    expect(screen.getByText('Team Knowledge Graph')).toBeInTheDocument();
    expect(screen.getByText('AI-powered institutional memory for your team')).toBeInTheDocument();
  });

  it('displays knowledge entries', () => {
    render(<KnowledgeGraphPage />);
    expect(screen.getByText('Component Naming')).toBeInTheDocument();
    expect(screen.getByText('State Management Choice')).toBeInTheDocument();
    expect(screen.getByText('API Error Handling')).toBeInTheDocument();
  });

  it('shows total stats', () => {
    render(<KnowledgeGraphPage />);
    expect(screen.getByText('Total Knowledge')).toBeInTheDocument();
    expect(screen.getByText('Conventions')).toBeInTheDocument();
  });

  it('filters by type', () => {
    render(<KnowledgeGraphPage />);
    
    // Click on 'convention' filter
    const conventionBtn = screen.getByText('convention');
    fireEvent.click(conventionBtn);
    
    // Should still show Component Naming (which is a convention)
    expect(screen.getByText('Component Naming')).toBeInTheDocument();
  });

  it('asks AI with search query', () => {
    render(<KnowledgeGraphPage />);
    
    const input = screen.getByPlaceholderText(/Ask anything about team conventions/);
    fireEvent.change(input, { target: { value: 'naming' } });
    
    const askBtn = screen.getByText('Ask AI');
    fireEvent.click(askBtn);
    
    // Should show AI response
    expect(screen.getByText(/Based on team knowledge:/)).toBeInTheDocument();
  });

  it('shows tags for entries', () => {
    render(<KnowledgeGraphPage />);
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('state')).toBeInTheDocument();
  });
});
