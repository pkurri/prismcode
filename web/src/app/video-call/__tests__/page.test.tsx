import { render, screen, fireEvent } from '@testing-library/react';
import VideoCollaborationPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: any) => <div>{children}</div>,
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children }: any) => <button>{children}</button>,
  TabsContent: ({ children }: any) => <div>{children}</div>,
}));

describe('VideoCollaborationPage', () => {
  it('renders page header', () => {
    render(<VideoCollaborationPage />);
    expect(screen.getByText('Video Collaboration')).toBeInTheDocument();
    expect(screen.getByText('Voice and video calls with your team')).toBeInTheDocument();
  });

  it('shows start call button initially', () => {
    render(<VideoCollaborationPage />);
    expect(screen.getByText('📹 Start Call')).toBeInTheDocument();
  });

  it('starts and ends a call', () => {
    render(<VideoCollaborationPage />);
    
    // Start call
    fireEvent.click(screen.getByText('📹 Start Call'));
    expect(screen.getByText('📵 End Call')).toBeInTheDocument();
    
    // Should show participants
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
    expect(screen.getByText('Alex Thompson')).toBeInTheDocument();
    
    // End call
    fireEvent.click(screen.getByText('📵 End Call'));
    expect(screen.getByText('📹 Start Call')).toBeInTheDocument();
  });

  it('lists past recordings', () => {
    render(<VideoCollaborationPage />);
    expect(screen.getByText('Sprint Planning Session')).toBeInTheDocument();
    expect(screen.getByText('Code Review: Auth Flow')).toBeInTheDocument();
  });
});
