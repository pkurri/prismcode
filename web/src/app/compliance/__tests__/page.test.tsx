import { render, screen } from '@testing-library/react';
import CompliancePage from '../page';

describe('CompliancePage', () => {
  it('renders page header', () => {
    render(<CompliancePage />);
    expect(screen.getAllByText(/Compliance/i)[0]).toBeInTheDocument();
  });

  it('displays content', () => {
    render(<CompliancePage />);
    expect(document.body).toBeInTheDocument();
  });
});
