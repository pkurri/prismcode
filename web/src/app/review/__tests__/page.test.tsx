import { render, screen } from '@testing-library/react';
import CodeReviewPage from '../page';

describe('CodeReviewPage', () => {
  it('renders code review page', () => {
    render(<CodeReviewPage />);
    expect(screen.getByText('Code Review Assistant')).toBeInTheDocument();
  });
});
