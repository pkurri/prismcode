import { render, screen } from '@testing-library/react';
import LocalModelsPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('LocalModelsPage', () => {
  it('renders page header', () => {
    render(<LocalModelsPage />);
    expect(screen.getByRole('heading', { name: /Local Models/i })).toBeInTheDocument();
  });

  it('displays models list', () => {
    render(<LocalModelsPage />);
    expect(screen.getAllByText(/Llama/i)[0]).toBeInTheDocument();
  });

  it('shows download button', () => {
    render(<LocalModelsPage />);
    expect(screen.getAllByText(/Download/i)[0]).toBeInTheDocument();
  });

  it('displays model sizes', () => {
    render(<LocalModelsPage />);
    expect(screen.getAllByText(/GB/i)[0]).toBeInTheDocument();
  });
});
