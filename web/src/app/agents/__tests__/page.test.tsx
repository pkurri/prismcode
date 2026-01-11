import { render } from '@testing-library/react';
import AgentsPage from '../page';

describe('AgentsPage', () => {
  it('renders the page', () => {
    render(<AgentsPage />);
    expect(document.body).toBeInTheDocument();
  });
});
