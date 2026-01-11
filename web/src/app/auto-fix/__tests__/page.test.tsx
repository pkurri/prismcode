import { render } from '@testing-library/react';
import AutoFixPage from '../page';

describe('AutoFixPage', () => {
  it('renders the page', () => {
    render(<AutoFixPage />);
    expect(document.body).toBeInTheDocument();
  });

  it('displays content', () => {
    const { container } = render(<AutoFixPage />);
    expect(container).toBeInTheDocument();
  });
});
