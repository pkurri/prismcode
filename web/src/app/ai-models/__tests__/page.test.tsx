import { render, screen } from '@testing-library/react';
import AIModelDashboardPage from '../page';

describe('AIModelDashboardPage', () => {
  it('renders page header', () => {
    render(<AIModelDashboardPage />);
    expect(screen.getByText('AI Model Selection')).toBeInTheDocument();
  });

  it('displays models', () => {
    render(<AIModelDashboardPage />);
    expect(screen.getByText('GPT-4 Turbo')).toBeInTheDocument();
  });
});
