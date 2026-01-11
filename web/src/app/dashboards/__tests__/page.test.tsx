import { render } from '@testing-library/react';
import DashboardsPage from '../page';

describe('DashboardsPage', () => {
  it('renders the page', () => {
    render(<DashboardsPage />);
    expect(document.body).toBeInTheDocument();
  });
});
