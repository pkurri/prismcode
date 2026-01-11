import { render, screen } from '@testing-library/react';
import LivePlaygroundPage from '../page';

describe('LivePlaygroundPage', () => {
  it('renders page header', () => {
    render(<LivePlaygroundPage />);
    expect(screen.getByText('Live Code Playground')).toBeInTheDocument();
  });
});
