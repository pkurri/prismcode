import { render, screen } from '@testing-library/react';
import WorkflowBuilderPage from '../page';

describe('WorkflowBuilderPage', () => {
  it('renders workflow builder', () => {
    render(<WorkflowBuilderPage />);
    expect(screen.getByText('PR Review Automation')).toBeInTheDocument();
  });
});
