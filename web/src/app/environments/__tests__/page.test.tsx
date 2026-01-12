import { render, screen } from '@testing-library/react';
import EnvironmentsPage from '../page';

describe('EnvironmentsPage', () => {
  it('renders environments', () => {
    render(<EnvironmentsPage />);
    expect(screen.getByText('Sandbox Environments')).toBeInTheDocument();
  });
});
