import { render, screen } from '@testing-library/react';
import { MobileBottomNav } from '../mobile-nav';

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('MobileBottomNav', () => {
  it('renders mobile navigation', () => {
    render(<MobileBottomNav />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Agents')).toBeInTheDocument();
  });
});
