import { render, screen } from '@testing-library/react';
import SettingsPage from '../page';

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, size }: { children: React.ReactNode; size?: string }) => (
    <button data-size={size}>{children}</button>
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ defaultValue }: { defaultValue?: string }) => (
    <input defaultValue={defaultValue} data-testid="input" />
  ),
}));

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <button data-testid={`tab-${value}`}>{children}</button>
  ),
  TabsContent: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid={`content-${value}`}>{children}</div>
  ),
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr data-testid="separator" />,
}));

describe('SettingsPage', () => {
  it('renders the page header', () => {
    render(<SettingsPage />);
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Manage your account and preferences')).toBeInTheDocument();
  });

  it('renders tab navigation', () => {
    render(<SettingsPage />);
    expect(screen.getByTestId('tab-general')).toBeInTheDocument();
    expect(screen.getByTestId('tab-api')).toBeInTheDocument();
    expect(screen.getByTestId('tab-ai')).toBeInTheDocument();
    expect(screen.getByTestId('tab-notifications')).toBeInTheDocument();
  });

  it('renders profile section', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Your account information')).toBeInTheDocument();
  });

  it('renders profile field labels', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    const emailLabels = screen.getAllByText('Email');
    expect(emailLabels.length).toBeGreaterThan(0);
    expect(screen.getByText('Organization')).toBeInTheDocument();
  });

  it('renders preferences section', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Preferences')).toBeInTheDocument();
    expect(screen.getByText('Dark Mode')).toBeInTheDocument();
    expect(screen.getByText('Auto-Fix Suggestions')).toBeInTheDocument();
    expect(screen.getByText('Telemetry')).toBeInTheDocument();
  });

  it('renders AI models section', () => {
    render(<SettingsPage />);
    expect(screen.getByText('AI Model Configuration')).toBeInTheDocument();
    expect(screen.getByText('GPT-4 Turbo')).toBeInTheDocument();
    expect(screen.getByText('Claude 3.5 Sonnet')).toBeInTheDocument();
    expect(screen.getByText('Llama 3.2 (Local)')).toBeInTheDocument();
  });

  it('renders save button', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('renders API section content', () => {
    render(<SettingsPage />);
    expect(screen.getByTestId('content-api')).toBeInTheDocument();
    expect(screen.getByText('Manage your API access keys')).toBeInTheDocument();
  });
});
