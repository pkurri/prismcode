import { render, screen } from '@testing-library/react';
import VisualPreviewPage from '../page';

// Mock Textarea
jest.mock('@/components/ui/textarea', () => ({
  Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea data-testid="textarea" {...props} />
  ),
}));

describe('VisualPreviewPage', () => {
  it('renders page header', () => {
    render(<VisualPreviewPage />);
    expect(screen.getByText('Visual Preview')).toBeInTheDocument();
  });

  it('shows prompt section', () => {
    render(<VisualPreviewPage />);
    expect(screen.getByText('Prompt')).toBeInTheDocument();
  });

  it('displays example buttons', () => {
    render(<VisualPreviewPage />);
    expect(screen.getByText('Example 1')).toBeInTheDocument();
    expect(screen.getByText('Example 2')).toBeInTheDocument();
  });

  it('shows generate button', () => {
    render(<VisualPreviewPage />);
    expect(screen.getByText('Generate UI')).toBeInTheDocument();
  });

  it('displays code section', () => {
    render(<VisualPreviewPage />);
    expect(screen.getByText('Generated Code')).toBeInTheDocument();
  });
});
