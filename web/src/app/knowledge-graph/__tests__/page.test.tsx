import { render, screen } from '@testing-library/react';
import KnowledgeGraphPage from '../page';

describe('KnowledgeGraphPage', () => {
  it('renders page header', () => {
    render(<KnowledgeGraphPage />);
    expect(screen.getByText('Team Knowledge Graph')).toBeInTheDocument();
  });
});
