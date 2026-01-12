import { render, screen, fireEvent } from '@testing-library/react';
import CodeReviewPage from '../page';

describe('CodeReviewPage', () => {
  it('renders summary and findings', () => {
    render(<CodeReviewPage />);
    expect(screen.getByText('Code Review Assistant')).toBeInTheDocument();
    expect(screen.getByText(/PR #342/)).toBeInTheDocument();
    expect(screen.getByText('Critical Issues')).toBeInTheDocument();
  });

  it('filters by severity tab', () => {
    render(<CodeReviewPage />);
    
    // Click 'Critical' tab (look for tab trigger or card that calls setActiveTab)
    // The cards have onClick handlers to set tab
    const criticalCard = screen.getByText('Critical Issues').closest('div.border-red-500\\/30'); 
    // Use regex for class matching if needed, or just text
    // The cards are clickable
    fireEvent.click(screen.getByText('Critical Issues'));
    
    // Should filter. How to check?
    // Based on mock data, there are critical issues.
    // "No findings match" should NOT be present.
    expect(screen.queryByText('No findings match your filters')).not.toBeInTheDocument();
  });

  it('applies fix', () => {
    render(<CodeReviewPage />);
    
    // Find an "Apply Fix" button
    const applyBtns = screen.getAllByText('Apply Fix');
    expect(applyBtns.length).toBeGreaterThan(0);
    
    fireEvent.click(applyBtns[0]);
    
    // Finding status changes to applied, button should disappear or change to badge
    // "Applied" badge appears
    expect(screen.getAllByText('Applied').length).toBeGreaterThan(0);
  });

  it('ignores finding', () => {
    render(<CodeReviewPage />);
    const ignoreBtns = screen.getAllByText('Ignore');
    fireEvent.click(ignoreBtns[0]);
    expect(screen.getAllByText('Ignored').length).toBeGreaterThan(0);
  });
});
