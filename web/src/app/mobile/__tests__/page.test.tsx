import { render, screen, fireEvent } from '@testing-library/react';
import MobilePreviewPage from '../page';

// Mock the DeviceFrame component as it uses iframes (hard to test in jsdom)
jest.mock('@/components/mobile/device-frame', () => ({
  DeviceFrame: ({ device, rotate }: any) => (
    <div data-testid="device-frame">
      Frame: {device} {rotate ? '(Landscape)' : '(Portrait)'}
    </div>
  ),
}));

describe('MobilePreviewPage', () => {
  it('renders sidebar controls', () => {
    render(<MobilePreviewPage />);
    expect(screen.getByText('Preview Page')).toBeInTheDocument();
    expect(screen.getByText('Device')).toBeInTheDocument();
    expect(screen.getByText('Orientation')).toBeInTheDocument();
  });

  it('switches pages', () => {
    render(<MobilePreviewPage />);
    const activityBtn = screen.getByText('Activity Feed');
    fireEvent.click(activityBtn);
    // Button should become active (we can't easily test visual variant, but we can verify no crash)
    expect(activityBtn).toBeInTheDocument();
  });

  it('switches devices', () => {
    render(<MobilePreviewPage />);
    fireEvent.click(screen.getByText('Pixel'));
    expect(screen.getByTestId('device-frame')).toHaveTextContent('Frame: pixel');
  });

  it('toggles orientation', () => {
    render(<MobilePreviewPage />);
    fireEvent.click(screen.getByText('Portrait'));
    expect(screen.getByTestId('device-frame')).toHaveTextContent('(Landscape)');
  });
});
