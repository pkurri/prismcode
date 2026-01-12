import { render, screen, fireEvent } from '@testing-library/react';
import WorkflowCanvasPage from '../page';

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

describe('WorkflowCanvasPage', () => {
  it('renders palette and initial nodes', () => {
    render(<WorkflowCanvasPage />);
    
    // Check palette
    const aiReviewPalette = screen.getAllByText('AI Review')[0];
    expect(aiReviewPalette).toBeInTheDocument();
    
    // Check initial nodes on canvas
    expect(screen.getByText('GitHub PR')).toBeInTheDocument();
    // The "AI Review" node on canvas is the second one
    const aiReviewNode = screen.getAllByText('AI Review')[1];
    expect(aiReviewNode).toBeInTheDocument();
    expect(screen.getByText('Auto Merge')).toBeInTheDocument();
  });

  it('validates workflow', () => {
    render(<WorkflowCanvasPage />);
    
    const validateBtn = screen.getByText('✓ Validate');
    fireEvent.click(validateBtn);
    
    // Initial workflow should be valid (no errors shown)
    expect(screen.queryByText('⚠️')).not.toBeInTheDocument();
  });

  it('handles delete node', () => {
    render(<WorkflowCanvasPage />);
    
    // Select a node first
    const node = screen.getByText('GitHub PR');
    fireEvent.click(node); // click wrapper div?
    
    const deleteBtn = screen.getByText('🗑️ Delete');
    expect(deleteBtn).not.toBeDisabled();
    
    fireEvent.click(deleteBtn);
    expect(screen.queryByText('GitHub PR')).not.toBeInTheDocument();
  });

  it('updates zoom', () => {
    render(<WorkflowCanvasPage />);
    const zoomIn = screen.getByText('+');
    fireEvent.click(zoomIn);
    expect(screen.getByText('110%')).toBeInTheDocument();
  });
});
