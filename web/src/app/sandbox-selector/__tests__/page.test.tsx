import { render, screen } from '@testing-library/react';
import SandboxSelectorPage from '../page';

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('SandboxSelectorPage', () => {
  it('renders page header', () => {
    render(<SandboxSelectorPage />);
    expect(screen.getByText('Sandbox Environments')).toBeInTheDocument();
  });
});
