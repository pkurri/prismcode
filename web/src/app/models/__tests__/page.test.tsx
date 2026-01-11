import { render, screen } from '@testing-library/react';
import ModelsPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock fetch
global.fetch = jest.fn().mockResolvedValue({
  json: () => Promise.resolve({ success: true, data: { models: [], usage: {}, routing: {} } }),
});

describe('ModelsPage', () => {
  it('renders page header', () => {
    render(<ModelsPage />);
    expect(screen.getByRole('heading', { name: /Model/i })).toBeInTheDocument();
  });

  it('displays models list section', () => {
    render(<ModelsPage />);
    expect(screen.getAllByText(/Model/i)[0]).toBeInTheDocument();
  });

  it('shows routing options', () => {
    render(<ModelsPage />);
    expect(screen.getAllByText(/Routing/i)[0]).toBeInTheDocument();
  });
});
