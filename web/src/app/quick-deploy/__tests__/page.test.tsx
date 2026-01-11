import { render, screen } from '@testing-library/react';
import OneClickDeployPage from '../page';

describe('OneClickDeployPage', () => {
  it('renders page header', () => {
    render(<OneClickDeployPage />);
    expect(screen.getByText('One-Click Deploy')).toBeInTheDocument();
  });

  it('shows quick actions', () => {
    render(<OneClickDeployPage />);
    expect(screen.getByText('Deploy to Staging')).toBeInTheDocument();
    expect(screen.getByText('Deploy to Production')).toBeInTheDocument();
  });

  it('displays deploy targets section', () => {
    render(<OneClickDeployPage />);
    expect(screen.getByText('Deploy Targets')).toBeInTheDocument();
  });

  it('shows environment types', () => {
    render(<OneClickDeployPage />);
    expect(screen.getAllByText(/production/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/staging/i)[0]).toBeInTheDocument();
  });
});
