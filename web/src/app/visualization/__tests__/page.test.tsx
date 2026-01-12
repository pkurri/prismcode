import { render, screen } from '@testing-library/react';
import VisualizationPage from '../page';

describe('VisualizationPage', () => {
  it('renders visualization page', () => {
    render(<VisualizationPage />);
    expect(screen.getByText('Data Visualization Studio')).toBeInTheDocument();
  });
});
