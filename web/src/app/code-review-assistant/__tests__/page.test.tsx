import { render, screen } from '@testing-library/react';
import CodeReviewAssistantPage from '../page';

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('CodeReviewAssistantPage', () => {
  it('renders page header', () => {
    render(<CodeReviewAssistantPage />);
    expect(screen.getByText('AI Code Review Assistant')).toBeInTheDocument();
  });
});
