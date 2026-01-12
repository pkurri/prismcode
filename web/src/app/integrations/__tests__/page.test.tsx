import { render, screen, fireEvent } from '@testing-library/react';
import IntegrationsPage from '../page';

describe('IntegrationsPage', () => {
  it('renders integration list', () => {
    render(<IntegrationsPage />);
    expect(screen.getByText('Integrations Hub')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Slack')).toBeInTheDocument();
  });

  it('allows filtering', () => {
    render(<IntegrationsPage />);
    const input = screen.getByPlaceholderText('Search integrations...');
    fireEvent.change(input, { target: { value: 'GitHub' } });
    expect(screen.getByText('GitHub')).toBeInTheDocument();
  });

  it('allows selection', () => {
    render(<IntegrationsPage />);
    const githubCard = screen.getByText('GitHub').closest('div');
    if (githubCard) {
      fireEvent.click(githubCard);
      expect(screen.getByText('Configure')).toBeInTheDocument();
    }
  });
});
