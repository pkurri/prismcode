import { render, screen } from '@testing-library/react';
import SessionSharingPage from '../page';

describe('SessionSharingPage', () => {
  it('renders page header', () => {
    render(<SessionSharingPage />);
    expect(screen.getByText('Live Collaboration Sessions')).toBeInTheDocument();
  });
});
