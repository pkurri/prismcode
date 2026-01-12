import { render, screen } from '@testing-library/react';
import ProjectSettingsPage from '../page';

describe('ProjectSettingsPage', () => {
  it('renders project settings', () => {
    render(<ProjectSettingsPage />);
    expect(screen.getByText('Project Settings')).toBeInTheDocument();
  });
});
