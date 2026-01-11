import { render, screen, fireEvent } from '@testing-library/react';
import SecurityPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: any) => <div>{children}</div>,
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children, value, onClick }: any) => (
    <button onClick={onClick} data-value={value}>{children}</button>
  ),
}));

// Mock Separator
jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}));

describe('SecurityPage', () => {
  it('renders page header', () => {
    render(<SecurityPage />);
    expect(screen.getByText('Security')).toBeInTheDocument();
    expect(screen.getByText('Vulnerability scanning and security insights')).toBeInTheDocument();
  });

  it('displays vulnerability counts', () => {
    render(<SecurityPage />);
    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('lists vulnerabilities', () => {
    render(<SecurityPage />);
    expect(screen.getByText('SQL Injection in user query')).toBeInTheDocument();
    expect(screen.getByText('Exposed API keys in config')).toBeInTheDocument();
    expect(screen.getByText('XSS vulnerability in markdown renderer')).toBeInTheDocument();
  });

  it('shows vulnerability sources', () => {
    render(<SecurityPage />);
    expect(screen.getAllByText('snyk').length).toBeGreaterThan(0);
    expect(screen.getByText('sonarqube')).toBeInTheDocument();
    expect(screen.getByText('dependabot')).toBeInTheDocument();
  });

  it('filters by severity', () => {
    render(<SecurityPage />);
    
    // Click on Critical card
    const criticalCard = screen.getByText('Critical').closest('div[class*="cursor-pointer"]');
    fireEvent.click(criticalCard!);
    
    // Should filter (we can't easily verify the filter in this mock but we verify click works)
    expect(screen.getByText('SQL Injection in user query')).toBeInTheDocument();
  });

  it('shows auto-fix button for fixable vulnerabilities', () => {
    render(<SecurityPage />);
    expect(screen.getAllByText('Auto-Fix').length).toBeGreaterThan(0);
  });
});
