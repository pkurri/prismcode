import { render } from '@testing-library/react';
import SignInPage from '../page';

describe('SignInPage', () => {
  it('renders the page', () => {
    render(<SignInPage />);
    expect(document.body).toBeInTheDocument();
  });
});
