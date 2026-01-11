import { render } from '@testing-library/react';
import GreenSuggestionsPage from '../page';

describe('GreenSuggestionsPage', () => {
  it('renders the page', () => {
    render(<GreenSuggestionsPage />);
    expect(document.body).toBeInTheDocument();
  });
});
