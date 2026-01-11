import { render } from '@testing-library/react';
import CarbonAnalyzerPage from '../page';

describe('CarbonAnalyzerPage', () => {
  it('renders the page', () => {
    render(<CarbonAnalyzerPage />);
    expect(document.body).toBeInTheDocument();
  });
});
