import { render, screen } from '@testing-library/react';
import AchievementsPage from '../page';

describe('AchievementsPage', () => {
  it('renders achievements page', () => {
    render(<AchievementsPage />);
    expect(screen.getByText('Achievements')).toBeInTheDocument();
  });
});
