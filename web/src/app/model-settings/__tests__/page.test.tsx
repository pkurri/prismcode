import { render, screen } from '@testing-library/react';
import ModelSettingsPage from '../page';

// Mock Switch
jest.mock('@/components/ui/switch', () => ({
  Switch: ({ checked }: { checked: boolean }) => (
    <button data-testid="switch" data-checked={checked}>Switch</button>
  ),
}));

// Mock Slider
jest.mock('@/components/ui/slider', () => ({
  Slider: () => <div data-testid="slider">Slider</div>,
}));

// Mock Separator
jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}));

describe('ModelSettingsPage', () => {
  it('renders page header', () => {
    render(<ModelSettingsPage />);
    expect(screen.getByText('AI Model Orchestration')).toBeInTheDocument();
  });

  it('shows routing strategy section', () => {
    render(<ModelSettingsPage />);
    expect(screen.getByText('Routing Strategy')).toBeInTheDocument();
  });

  it('displays model registry', () => {
    render(<ModelSettingsPage />);
    expect(screen.getByText('Model Registry')).toBeInTheDocument();
  });

  it('shows API keys section', () => {
    render(<ModelSettingsPage />);
    expect(screen.getByText('API Keys')).toBeInTheDocument();
  });

  it('displays available models', () => {
    render(<ModelSettingsPage />);
    expect(screen.getAllByText(/GPT-4/i)[0]).toBeInTheDocument();
  });
});
