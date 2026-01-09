import { render, screen, fireEvent } from '@testing-library/react';
import AssistantPage from '../page';

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled} data-testid="button">
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({
    value,
    onChange,
    placeholder,
    disabled,
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    disabled?: boolean;
  }) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      data-testid="input"
    />
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
}));

jest.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="avatar">{children}</div>
  ),
  AvatarFallback: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

describe('AssistantPage', () => {
  it('renders the page header', () => {
    render(<AssistantPage />);
    expect(screen.getByRole('heading', { name: 'AI Assistant' })).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<AssistantPage />);
    expect(screen.getByText('Your intelligent coding companion')).toBeInTheDocument();
  });

  it('renders initial AI greeting message', () => {
    render(<AssistantPage />);
    expect(screen.getByText(/Hello! I'm PrismCode AI Assistant/)).toBeInTheDocument();
  });

  it('renders the GPT-4 Active badge', () => {
    render(<AssistantPage />);
    expect(screen.getByText('GPT-4 Active')).toBeInTheDocument();
  });

  it('renders suggestion buttons', () => {
    render(<AssistantPage />);
    expect(screen.getByText('Analyze my code for bugs')).toBeInTheDocument();
    expect(screen.getByText('Generate tests for utils/')).toBeInTheDocument();
    expect(screen.getByText('Find performance issues')).toBeInTheDocument();
  });

  it('renders the input field', () => {
    render(<AssistantPage />);
    const input = screen.getByPlaceholderText('Ask me anything about your code...');
    expect(input).toBeInTheDocument();
  });

  it('renders the send button', () => {
    render(<AssistantPage />);
    expect(screen.getByText('Send')).toBeInTheDocument();
  });

  it('updates input value on change', () => {
    render(<AssistantPage />);
    const input = screen.getByPlaceholderText(
      'Ask me anything about your code...'
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test message' } });
    expect(input.value).toBe('test message');
  });

  it('clicking suggestion fills input', () => {
    render(<AssistantPage />);
    const suggestionBtn = screen.getByText('Analyze my code for bugs');
    fireEvent.click(suggestionBtn);
    const input = screen.getByPlaceholderText(
      'Ask me anything about your code...'
    ) as HTMLInputElement;
    expect(input.value).toBe('Analyze my code for bugs');
  });

  it('renders AI avatar', () => {
    render(<AssistantPage />);
    expect(screen.getByText('AI')).toBeInTheDocument();
  });
});
