import { render } from '@testing-library/react';
import FlakyTestsPage from '../page';

describe('FlakyTestsPage', () => {
  it('renders the page', () => {
    render(<FlakyTestsPage />);
    expect(document.body).toBeInTheDocument();
  });
});
