import { render, screen } from '@testing-library/react';
import { Avatar, AvatarImage, AvatarFallback } from '../avatar';
import { Progress } from '../progress';
import { ScrollArea } from '../scroll-area';
import { Slider } from '../slider';
import { Switch } from '../switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../tabs';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../tooltip';

describe('Interactive UI Components', () => {
  describe('Avatar', () => {
    it('renders fallback when no image', () => {
      render(
        <Avatar>
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByText('CN')).toBeInTheDocument();
    });
  });

  describe('Progress', () => {
    it('renders', () => {
      render(<Progress value={50} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('ScrollArea', () => {
    it('renders content', () => {
      render(
        <ScrollArea className="h-20">
          <div>Scrollable Content</div>
        </ScrollArea>
      );
      expect(screen.getByText('Scrollable Content')).toBeInTheDocument();
    });
  });

  describe('Slider', () => {
    it('renders', () => {
      render(<Slider defaultValue={[50]} max={100} step={1} />);
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });
  });

  describe('Switch', () => {
    it('renders', () => {
      render(<Switch />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });
  });

  describe('Tabs', () => {
    it('renders tabs', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );
      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });
  });

  describe('Tooltip', () => {
    it('renders trigger', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent>Tooltip Text</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      expect(screen.getByText('Hover me')).toBeInTheDocument();
    });
  });
});
