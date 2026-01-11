import { render, screen } from '@testing-library/react';
import NotificationsPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock window.Notification
global.Notification = {
  requestPermission: jest.fn().mockResolvedValue('granted'),
} as unknown as typeof Notification;

describe('NotificationsPage', () => {
  it('renders page header', () => {
    render(<NotificationsPage />);
    expect(screen.getByRole('heading', { name: /Notifications/i })).toBeInTheDocument();
  });

  it('displays notification content', () => {
    render(<NotificationsPage />);
    expect(screen.getAllByText(/Notification/i)[0]).toBeInTheDocument();
  });
});
