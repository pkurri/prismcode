import { render, screen } from '@testing-library/react';
import IntegrationsHubPage from '../page';

describe('IntegrationsHubPage', () => {
  it('renders page header', () => {
    render(<IntegrationsHubPage />);
    expect(screen.getByText('Integrations Hub')).toBeInTheDocument();
  });

  it('displays integrations', () => {
    render(<IntegrationsHubPage />);
    expect(screen.getByText('GitHub')).toBeInTheDocument();
  });
});
