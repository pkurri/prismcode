import { render, screen } from '@testing-library/react';
import TestsPage from '../page';

describe('TestsPage', () => {
  it('renders tests page', () => {
    render(<TestsPage />);
    expect(screen.getByText('Test Intelligence')).toBeInTheDocument();
  });
});
