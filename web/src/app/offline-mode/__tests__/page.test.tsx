import { render, screen, fireEvent } from '@testing-library/react';
import OfflineModePage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: any) => <div>{children}</div>,
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children }: any) => <button>{children}</button>,
  TabsContent: ({ children }: any) => <div>{children}</div>,
}));

describe('OfflineModePage', () => {
  it('renders page header', () => {
    render(<OfflineModePage />);
    expect(screen.getByText('Offline Sync Center')).toBeInTheDocument();
    expect(screen.getByText('Manage your offline actions and sync status')).toBeInTheDocument();
  });

  it('shows online status by default', () => {
    render(<OfflineModePage />);
    expect(screen.getByText('Online')).toBeInTheDocument();
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('displays pending actions', () => {
    render(<OfflineModePage />);
    expect(screen.getByText('Added comment on PR #342')).toBeInTheDocument();
    expect(screen.getByText('Approved PR #340')).toBeInTheDocument();
  });

  it('shows sync queue count', () => {
    render(<OfflineModePage />);
    expect(screen.getByText('3 actions pending synchronization')).toBeInTheDocument();
  });

  it('toggles connection status', () => {
    render(<OfflineModePage />);
    
    const toggleBtn = screen.getByText('Toggle Connection');
    fireEvent.click(toggleBtn);
    
    expect(screen.getByText('Offline')).toBeInTheDocument();
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('shows service worker status', () => {
    render(<OfflineModePage />);
    expect(screen.getByText('Service Worker')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});
