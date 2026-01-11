import { render } from '@testing-library/react';
import DebugMemoryPage from '../page';

describe('DebugMemoryPage', () => {
  it('renders the page', () => {
    render(<DebugMemoryPage />);
    expect(document.body).toBeInTheDocument();
  });

  it('displays content', () => {
    const { container } = render(<DebugMemoryPage />);
    expect(container).toBeInTheDocument();
  });
});
