import { render, screen } from '@testing-library/react';
import { Badge } from '../badge';
import { Button } from '../button';
import { Card, CardHeader, CardTitle, CardContent } from '../card';
import { Input } from '../input';
import { Separator } from '../separator';
import { Skeleton } from '../skeleton';
import { Textarea } from '../textarea';

describe('Common UI Components', () => {
  describe('Badge', () => {
    it('renders', () => {
      render(<Badge>Test Badge</Badge>);
      expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });
  });

  describe('Button', () => {
    it('renders', () => {
      render(<Button>Click Me</Button>);
      expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument();
    });
  });

  describe('Card', () => {
    it('renders content', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
          <CardContent>Card Content</CardContent>
        </Card>
      );
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });
  });

  describe('Input', () => {
    it('renders', () => {
      render(<Input placeholder="Type here" />);
      expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument();
    });
  });

  describe('Separator', () => {
    it('renders', () => {
      const { container } = render(<Separator />);
      expect(container.firstChild).toHaveClass('bg-border');
    });
  });

  describe('Skeleton', () => {
    it('renders', () => {
      const { container } = render(<Skeleton className="w-10 h-10" />);
      expect(container.firstChild).toHaveClass('animate-pulse');
    });
  });

  describe('Textarea', () => {
    it('renders', () => {
      render(<Textarea placeholder="Long text" />);
      expect(screen.getByPlaceholderText('Long text')).toBeInTheDocument();
    });
  });
});
