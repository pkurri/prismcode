import { render } from '@testing-library/react';
import TestGenerationPage from '../page';

describe('TestGenerationPage', () => {
  it('renders the page', () => {
    render(<TestGenerationPage />);
    expect(document.body).toBeInTheDocument();
  });
});
