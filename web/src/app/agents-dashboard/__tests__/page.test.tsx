import { render, screen } from '@testing-library/react';
import AgentsDashboardPage from '../page';

describe('AgentsDashboardPage', () => {
  it('renders page header', () => {
    render(<AgentsDashboardPage />);
    expect(screen.getAllByText(/Agent/i)[0]).toBeInTheDocument();
  });

  it('displays content', () => {
    render(<AgentsDashboardPage />);
    expect(document.body).toBeInTheDocument();
  });
});
