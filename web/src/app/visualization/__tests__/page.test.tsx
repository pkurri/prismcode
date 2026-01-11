import { render, screen } from '@testing-library/react';
import VisualizationPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('VisualizationPage', () => {
  it('renders page header', () => {
    render(<VisualizationPage />);
    expect(screen.getByRole('heading', { name: /Visualization/i })).toBeInTheDocument();
  });

  it('displays content', () => {
    render(<VisualizationPage />);
    expect(screen.getAllByText(/Dashboard/i)[0]).toBeInTheDocument();
  });
});
