import { render } from '@testing-library/react';
import ScreenReaderTestPage from '../page';

describe('ScreenReaderTestPage', () => {
  it('renders the page', () => {
    render(<ScreenReaderTestPage />);
    expect(document.body).toBeInTheDocument();
  });
});
