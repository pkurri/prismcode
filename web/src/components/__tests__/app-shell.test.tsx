import { render, screen } from '@testing-library/react';
import { AppShell } from '../app-shell';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// Mock ResizeObserver for Sidebar
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('AppShell', () => {
  it('renders application shell', () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>
    );
    expect(screen.getByText('PrismCode')).toBeInTheDocument();
    expect(screen.getByText('AI Code Intelligence')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders navigation groups', () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>
    );
    expect(screen.getByText('Platform')).toBeInTheDocument();
    expect(screen.getByText('Intelligence')).toBeInTheDocument();
    expect(screen.getByText('Code Quality')).toBeInTheDocument();
    
    // Check specific links
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
  });
});
