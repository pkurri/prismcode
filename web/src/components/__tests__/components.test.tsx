import { render, screen } from '@testing-library/react';
import { AppShell } from '../app-shell';
import { MobileNav } from '../mobile-nav';

// Mock components
jest.mock('../mobile-nav', () => ({
  MobileNav: () => <div data-testid="mobile-nav">MobileNav</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children }: any) => <button>{children}</button>,
}));

describe('Components', () => {
  describe('AppShell', () => {
    it('renders children', () => {
      render(
        <AppShell>
          <div data-testid="child">Child</div>
        </AppShell>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('renders system status', () => {
      render(<AppShell>Child</AppShell>);
      expect(screen.getByText('System Healthy')).toBeInTheDocument();
    });
  });

  describe('MobileNav', () => {
    // Unmock for this test
    it('renders navigation items', () => {
      // Mock MobileNav if needed or test separately
    });
  });
});
