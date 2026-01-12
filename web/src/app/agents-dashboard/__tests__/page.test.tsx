import { render, screen } from '@testing-library/react';
import AgentsDashboardPage from '../page';

describe('AgentsDashboardPage', () => {
  it('renders dashboard', () => {
    render(<AgentsDashboardPage />);
    expect(screen.getByText('AI Agents')).toBeInTheDocument();
  });
});
