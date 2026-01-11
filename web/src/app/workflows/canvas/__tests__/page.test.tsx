import { render } from '@testing-library/react';
import CanvasPage from '../page';

describe('CanvasPage', () => {
  it('renders the page', () => {
    render(<CanvasPage />);
    expect(document.body).toBeInTheDocument();
  });
});
