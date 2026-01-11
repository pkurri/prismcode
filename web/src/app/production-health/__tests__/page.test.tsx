import { render, screen } from '@testing-library/react';
import ProductionHealthPage from '../page';

describe('ProductionHealthPage', () => {
  it('renders page header', () => {
    render(<ProductionHealthPage />);
    expect(screen.getByText('Production Health Dashboard')).toBeInTheDocument();
  });
});
