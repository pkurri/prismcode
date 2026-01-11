import { render, screen } from '@testing-library/react';
import LiveDebugPage from '../page';

describe('LiveDebugPage', () => {
  it('renders page header', () => {
    render(<LiveDebugPage />);
    expect(screen.getByText('Live Debug Assistant')).toBeInTheDocument();
  });

  it('shows debug chat section', () => {
    render(<LiveDebugPage />);
    expect(screen.getByText('Debug Chat')).toBeInTheDocument();
  });

  it('displays suggested breakpoints', () => {
    render(<LiveDebugPage />);
    expect(screen.getByText('Suggested Breakpoints')).toBeInTheDocument();
  });

  it('shows execution flow', () => {
    render(<LiveDebugPage />);
    expect(screen.getByText('Execution Flow')).toBeInTheDocument();
  });

  it('displays chat input', () => {
    render(<LiveDebugPage />);
    expect(screen.getByPlaceholderText('Ask about your code...')).toBeInTheDocument();
  });
});
