import { render, screen } from '@testing-library/react';
import EditorPage from '../page';

describe('EditorPage', () => {
  it('renders editor', () => {
    render(<EditorPage />);
    expect(screen.getByText('Explorer')).toBeInTheDocument();
  });
});
