import { render, screen, waitFor } from '@testing-library/react';
import AIModelsPage from '../page';

// Mock global fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ models: [] }),
  })
) as jest.Mock;

describe('AIModelsPage', () => {
  it('renders models page', async () => {
    render(<AIModelsPage />);
    expect(screen.getByText('AI Model Selection')).toBeInTheDocument();
    
    // Wait for loading to finish to avoid act warnings
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
