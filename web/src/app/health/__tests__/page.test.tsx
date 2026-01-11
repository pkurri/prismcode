import { render, screen } from '@testing-library/react';
import ProductionHealthPage from '../page';

describe('ProductionHealthPage', () => {
  it('renders page header', () => {
    render(<ProductionHealthPage />);
    expect(screen.getByRole('heading', { name: /Production Health/i })).toBeInTheDocument();
  });

  it('displays health metrics', () => {
    render(<ProductionHealthPage />);
    expect(screen.getByText('Uptime')).toBeInTheDocument();
    expect(screen.getByText('Response Time')).toBeInTheDocument();
  });

  it('lists services', () => {
    render(<ProductionHealthPage />);
    expect(screen.getAllByText(/API Server/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Database/i)[0]).toBeInTheDocument();
  });

  it('shows incidents section', () => {
    render(<ProductionHealthPage />);
    expect(screen.getByText('Recent Incidents')).toBeInTheDocument();
  });
});
