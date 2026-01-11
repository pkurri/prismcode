import { render, screen, fireEvent } from '@testing-library/react';
import SessionSharingPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: any) => <div>{children}</div>,
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children }: any) => <button>{children}</button>,
  TabsContent: ({ children }: any) => <div>{children}</div>,
}));

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe('SessionSharingPage', () => {
  it('renders page header', () => {
    render(<SessionSharingPage />);
    expect(screen.getByText('Session Sharing')).toBeInTheDocument();
    expect(screen.getByText('Collaborate in real-time with your team')).toBeInTheDocument();
  });

  it('displays current session info', () => {
    render(<SessionSharingPage />);
    expect(screen.getByText('Feature Development Session')).toBeInTheDocument();
    expect(screen.getByText('session-abc123')).toBeInTheDocument();
  });

  it('lists participants', () => {
    render(<SessionSharingPage />);
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
    expect(screen.getByText('Alex Thompson')).toBeInTheDocument();
    expect(screen.getByText('Jordan Rivera')).toBeInTheDocument();
    expect(screen.getByText('AI Agent')).toBeInTheDocument();
  });

  it('shows participant roles', () => {
    render(<SessionSharingPage />);
    expect(screen.getByText('(owner)')).toBeInTheDocument();
    expect(screen.getAllByText('(editor)').length).toBeGreaterThan(0);
  });

  it('opens share modal', () => {
    render(<SessionSharingPage />);
    
    const shareBtn = screen.getByText('🔗 Share Session');
    fireEvent.click(shareBtn);
    
    expect(screen.getByText('🔗 Share This Workspace')).toBeInTheDocument();
    expect(screen.getByText('Permissions')).toBeInTheDocument();
  });

  it('shows session controls', () => {
    render(<SessionSharingPage />);
    expect(screen.getByText('Start Recording')).toBeInTheDocument();
    expect(screen.getByText('Invite via Email')).toBeInTheDocument();
    expect(screen.getByText('End Session')).toBeInTheDocument();
  });
});
