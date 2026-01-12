import { render, screen } from '@testing-library/react';
import WorkflowsPage from '../page';

describe('WorkflowsPage', () => {
  it('renders workflows', () => {
    render(<WorkflowsPage />);
    expect(screen.getByText('Workflow Builder')).toBeInTheDocument();
  });
});
