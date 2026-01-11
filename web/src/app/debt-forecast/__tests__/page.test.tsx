import { render } from '@testing-library/react';
import DebtForecastPage from '../page';

describe('DebtForecastPage', () => {
  it('renders the page', () => {
    render(<DebtForecastPage />);
    expect(document.body).toBeInTheDocument();
  });
});
