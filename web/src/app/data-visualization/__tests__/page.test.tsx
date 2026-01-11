import { render, screen } from '@testing-library/react';
import DataVisualizationPage from '../page';

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('DataVisualizationPage', () => {
  it('renders page header', () => {
    render(<DataVisualizationPage />);
    expect(screen.getByText('Data Visualization Studio')).toBeInTheDocument();
  });
});
