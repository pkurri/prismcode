import { render, screen } from '@testing-library/react';
import VisualWorkflowBuilderPage from '../page';

describe('VisualWorkflowBuilderPage', () => {
  it('renders page header', () => {
    render(<VisualWorkflowBuilderPage />);
    expect(screen.getByText('Visual Workflow Builder')).toBeInTheDocument();
  });
});
