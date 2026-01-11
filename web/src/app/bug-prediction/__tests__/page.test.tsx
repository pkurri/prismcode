import { render, screen } from '@testing-library/react';
import BugPredictionPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('BugPredictionPage', () => {
  it('renders page header', () => {
    render(<BugPredictionPage />);
    expect(screen.getAllByText(/Bug Prediction/i)[0]).toBeInTheDocument();
  });

  it('displays predictions', () => {
    render(<BugPredictionPage />);
    expect(screen.getAllByText(/Prediction/i)[0]).toBeInTheDocument();
  });
});
