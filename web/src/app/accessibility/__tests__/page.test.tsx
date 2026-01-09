import { render, screen } from '@testing-library/react';
import AccessibilityPage from '../page';

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
}));

describe('AccessibilityPage', () => {
  it('renders the page header', () => {
    render(<AccessibilityPage />);
    expect(screen.getByText('Accessibility')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<AccessibilityPage />);
    expect(screen.getByText('WCAG compliance and accessibility scanning')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<AccessibilityPage />);
    expect(screen.getByText('Screen Reader Test')).toBeInTheDocument();
    expect(screen.getByText('Run Full Scan')).toBeInTheDocument();
  });

  it('renders a11y score', () => {
    render(<AccessibilityPage />);
    expect(screen.getByText('A11y Score')).toBeInTheDocument();
    expect(screen.getByText('78%')).toBeInTheDocument();
  });

  it('renders critical issues count', () => {
    render(<AccessibilityPage />);
    expect(screen.getByText('critical')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders serious issues count', () => {
    render(<AccessibilityPage />);
    expect(screen.getByText('serious')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('renders WCAG compliance section', () => {
    render(<AccessibilityPage />);
    expect(screen.getByText('WCAG 2.1 Compliance')).toBeInTheDocument();
    expect(screen.getByText('Success criteria evaluation')).toBeInTheDocument();
  });

  it('renders WCAG criteria', () => {
    render(<AccessibilityPage />);
    expect(screen.getByText('1.1.1 Non-text Content')).toBeInTheDocument();
    expect(screen.getByText('1.4.3 Contrast (Minimum)')).toBeInTheDocument();
    expect(screen.getByText('2.1.1 Keyboard')).toBeInTheDocument();
  });

  it('renders quick actions section', () => {
    render(<AccessibilityPage />);
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Add Missing Alt Text')).toBeInTheDocument();
    expect(screen.getByText('Fix Color Contrast')).toBeInTheDocument();
  });
});
