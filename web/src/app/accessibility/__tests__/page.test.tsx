import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AccessibilityPage from '../page';

describe('AccessibilityPage', () => {
  it('renders accessibility overview', () => {
    render(<AccessibilityPage />);
    expect(screen.getByText('Accessibility')).toBeInTheDocument();
    expect(screen.getByText('WCAG 2.1 AA compliance monitoring and auto-remediation')).toBeInTheDocument();
  });

  it('displays correct score', () => {
    render(<AccessibilityPage />);
    expect(screen.getByText('78%')).toBeInTheDocument();
    expect(screen.getByText('Overall Compliance')).toBeInTheDocument();
  });

  it('runs full scan simulation', async () => {
    jest.useFakeTimers();
    render(<AccessibilityPage />);
    
    const scanBtn = screen.getByText('Run Full Scan');
    fireEvent.click(scanBtn);
    
    expect(screen.getByText('Scanning...')).toBeInTheDocument();
    expect(scanBtn).toBeDisabled();

    // Fast-forward scan duration
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
        expect(screen.getByText('Run Full Scan')).not.toBeDisabled();
    });
    
    jest.useRealTimers();
  });

  it('applies auto-fix', async () => {
    jest.useFakeTimers();
    render(<AccessibilityPage />);

    // Click "Add Missing Alt Text" button
    const fixBtn = screen.getByText('Add Missing Alt Text').closest('button');
    fireEvent.click(fixBtn!);

    // Check for success message
    await waitFor(() => {
        expect(screen.getByText(/Optimization applied for Alt Text/)).toBeInTheDocument();
    });

    // Message disappears after timeout
    jest.advanceTimersByTime(3000);
    
    await waitFor(() => {
        expect(screen.queryByText(/Optimization applied/)).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });
});
