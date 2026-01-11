import { render, screen } from '@testing-library/react';
import SandboxPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock PreviewFrame
jest.mock('@/components/sandbox/preview-frame', () => ({
  PreviewFrame: () => <div data-testid="preview-frame">Preview Frame</div>,
}));

// Mock fetch
global.fetch = jest.fn();

describe('SandboxPage', () => {
  it('renders the page', () => {
    render(<SandboxPage />);
    expect(document.body).toBeInTheDocument();
  });

  it('shows prompt input', () => {
    render(<SandboxPage />);
    expect(screen.getByPlaceholderText(/Describe a UI component/i)).toBeInTheDocument();
  });

  it('shows generate button', () => {
    render(<SandboxPage />);
    expect(screen.getByText('Generate UI')).toBeInTheDocument();
  });
});
