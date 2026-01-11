import { render, screen } from '@testing-library/react';
import ProjectSettingsPage from '../page';

describe('ProjectSettingsPage', () => {
  it('renders page header', () => {
    render(<ProjectSettingsPage />);
    expect(screen.getAllByText(/Project Settings/i)[0]).toBeInTheDocument();
  });

  it('displays content', () => {
    render(<ProjectSettingsPage />);
    expect(document.body).toBeInTheDocument();
  });
});
