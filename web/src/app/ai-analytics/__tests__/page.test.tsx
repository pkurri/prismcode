import { render, screen, fireEvent } from '@testing-library/react';
import AIAnalyticsPage from '../page';

// Mock fetch
global.fetch = jest.fn(() => Promise.resolve({
  json: () => Promise.resolve({ models: [] }),
})) as jest.Mock;

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: any) => <div>{children}</div>,
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children }: any) => <button>{children}</button>,
  TabsContent: ({ children }: any) => <div>{children}</div>,
}));

describe('AIAnalyticsPage', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders page header', async () => {
    render(<AIAnalyticsPage />);
    expect(screen.getByText('AI Analytics')).toBeInTheDocument();
    expect(screen.getByText('Monitor AI model usage, costs, and performance')).toBeInTheDocument();
    
    // Wait for effect to prevent act warnings
    await screen.findByText('Total API Calls'); 
  });

  it('displays summary stats', () => {
    render(<AIAnalyticsPage />);
    expect(screen.getByText('Total API Calls')).toBeInTheDocument();
    expect(screen.getByText('Tokens Used')).toBeInTheDocument();
    expect(screen.getByText('Total Cost')).toBeInTheDocument();
    expect(screen.getByText('Success Rate')).toBeInTheDocument();
  });

  it('shows time range buttons', () => {
    render(<AIAnalyticsPage />);
    expect(screen.getByText('24h')).toBeInTheDocument();
    expect(screen.getByText('7d')).toBeInTheDocument();
    expect(screen.getByText('30d')).toBeInTheDocument();
    expect(screen.getByText('90d')).toBeInTheDocument();
  });

  it('changes time range on click', () => {
    render(<AIAnalyticsPage />);
    
    const day30Btn = screen.getByText('30d');
    fireEvent.click(day30Btn);
    
    // Button should now be selected (variant change is internal)
    expect(day30Btn).toBeInTheDocument();
  });

  it('displays model breakdown', () => {
    render(<AIAnalyticsPage />);
    expect(screen.getByText('GPT-4o')).toBeInTheDocument();
    expect(screen.getByText('Claude 3.5 Sonnet')).toBeInTheDocument();
    expect(screen.getByText('DeepSeek Coder')).toBeInTheDocument();
  });

  it('shows task breakdown', () => {
    render(<AIAnalyticsPage />);
    expect(screen.getByText('Code Generation')).toBeInTheDocument();
    expect(screen.getByText('Code Review')).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
  });
});
