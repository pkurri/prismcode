import { render, screen } from '@testing-library/react';
import * as React from 'react';

// Import UI components
import { Avatar, AvatarFallback, AvatarImage } from '../avatar';
import { Badge } from '../badge';
import { Button } from '../button';
import { Card, CardHeader, CardTitle, CardContent } from '../card';
import { Input } from '../input';
import { Progress } from '../progress';
import { ScrollArea } from '../scroll-area';
import { Separator } from '../separator';
import { Skeleton } from '../skeleton';
import { Slider } from '../slider';
import { Switch } from '../switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../tabs';
import { Textarea } from '../textarea';

// Mock ResizeObserver for ScrollArea/Slider
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('UI Components Megabatch', () => {
    
  it('renders Avatar', () => {
    render(
      <Avatar>
        <AvatarImage src="" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('CN')).toBeInTheDocument();
  });

  it('renders Badge', () => {
    render(<Badge>Badge</Badge>);
    expect(screen.getByText('Badge')).toBeInTheDocument();
  });

  it('renders Button', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /Click me/i })).toBeInTheDocument();
  });

  it('renders Card', () => {
    render(
      <Card>
        <CardHeader>
            <CardTitle>Card Title</CardTitle>
        </CardHeader>
        <CardContent>Content</CardContent>
      </Card>
    );
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders Input', () => {
    render(<Input placeholder="Type here" />);
    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument();
  });

  it('renders Progress', () => {
    render(<Progress value={50} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders ScrollArea', () => {
    render(<ScrollArea className="h-[200px] w-[350px]">Content</ScrollArea>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders Separator', () => {
    render(<Separator />);
    // Separator usually has role 'separator'
    // Depending on implementation (radix), check properties or just rendering without crash.
    // It renders a div.
    const { container } = render(<Separator data-testid="sep" />);
    expect(screen.getByTestId('sep')).toBeInTheDocument();
  });

  it('renders Skeleton', () => {
    render(<Skeleton className="w-[100px] h-[20px]" data-testid="skeleton" />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('renders Slider', () => {
    render(<Slider defaultValue={[50]} max={100} step={1} />);
    // Slider triggers are usually verifyable by role slider
    expect(screen.getAllByRole('slider').length).toBeGreaterThan(0);
  });

  it('renders Switch', () => {
    render(<Switch aria-label="Toggle" />);
    expect(screen.getByRole('switch', { name: /Toggle/i })).toBeInTheDocument();
  });

  it('renders Tabs', () => {
    render(
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">Account Content</TabsContent>
        <TabsContent value="password">Password Content</TabsContent>
      </Tabs>
    );
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Account Content')).toBeInTheDocument();
  });

  it('renders Textarea', () => {
    render(<Textarea placeholder="Type message" />);
    expect(screen.getByPlaceholderText('Type message')).toBeInTheDocument();
  });
});
