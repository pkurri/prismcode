import { render, screen, fireEvent, act } from '@testing-library/react';
import * as React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarRail,
  SidebarSeparator,
  SidebarInput,
  SidebarMenuSkeleton,
  useSidebar,
} from '../sidebar';

// Mock useIsMobile hook
jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: jest.fn(() => false),
}));

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('Sidebar Component Suite', () => {
  describe('SidebarProvider', () => {
    it('renders children correctly', () => {
      render(
        <SidebarProvider>
          <div data-testid="child">Child Content</div>
        </SidebarProvider>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('provides sidebar context', () => {
      const TestConsumer = () => {
        const ctx = useSidebar();
        return <div data-testid="state">{ctx.state}</div>;
      };
      render(
        <SidebarProvider>
          <TestConsumer />
        </SidebarProvider>
      );
      expect(screen.getByTestId('state')).toHaveTextContent('expanded');
    });

    it('supports defaultOpen=false', () => {
      const TestConsumer = () => {
        const ctx = useSidebar();
        return <div data-testid="state">{ctx.state}</div>;
      };
      render(
        <SidebarProvider defaultOpen={false}>
          <TestConsumer />
        </SidebarProvider>
      );
      expect(screen.getByTestId('state')).toHaveTextContent('collapsed');
    });
  });

  describe('Sidebar', () => {
    it('renders with default props', () => {
      render(
        <SidebarProvider>
          <Sidebar data-testid="sidebar">
            <div>Content</div>
          </Sidebar>
        </SidebarProvider>
      );
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('renders collapsible=none variant', () => {
      render(
        <SidebarProvider>
          <Sidebar collapsible="none" data-testid="sidebar">
            <div>Content</div>
          </Sidebar>
        </SidebarProvider>
      );
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });
  });

  describe('SidebarTrigger', () => {
    it('toggles sidebar on click', async () => {
      const TestConsumer = () => {
        const ctx = useSidebar();
        return <div data-testid="state">{ctx.state}</div>;
      };
      render(
        <SidebarProvider>
          <SidebarTrigger data-testid="trigger" />
          <TestConsumer />
        </SidebarProvider>
      );
      
      expect(screen.getByTestId('state')).toHaveTextContent('expanded');
      await act(async () => {
        fireEvent.click(screen.getByTestId('trigger'));
      });
      expect(screen.getByTestId('state')).toHaveTextContent('collapsed');
    });
  });

  describe('Sidebar Sub-components', () => {
    it('renders SidebarHeader', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader data-testid="header">Header</SidebarHeader>
          </Sidebar>
        </SidebarProvider>
      );
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('renders SidebarContent', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent data-testid="content">Content</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      );
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('renders SidebarFooter', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarFooter data-testid="footer">Footer</SidebarFooter>
          </Sidebar>
        </SidebarProvider>
      );
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('renders SidebarGroup with label', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarGroup>
              <SidebarGroupLabel data-testid="label">Group</SidebarGroupLabel>
              <SidebarGroupContent>Content</SidebarGroupContent>
            </SidebarGroup>
          </Sidebar>
        </SidebarProvider>
      );
      expect(screen.getByTestId('label')).toBeInTheDocument();
    });

    it('renders SidebarMenu with items', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton data-testid="btn">Item 1</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </Sidebar>
        </SidebarProvider>
      );
      expect(screen.getByTestId('btn')).toBeInTheDocument();
    });

    it('renders SidebarInset', () => {
      render(
        <SidebarProvider>
          <SidebarInset data-testid="inset">Main Content</SidebarInset>
        </SidebarProvider>
      );
      expect(screen.getByTestId('inset')).toBeInTheDocument();
    });

    it('renders SidebarRail', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarRail data-testid="rail" />
          </Sidebar>
        </SidebarProvider>
      );
      expect(screen.getByTestId('rail')).toBeInTheDocument();
    });

    it('renders SidebarSeparator', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarSeparator data-testid="sep" />
          </Sidebar>
        </SidebarProvider>
      );
      expect(screen.getByTestId('sep')).toBeInTheDocument();
    });

    it('renders SidebarInput', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarInput placeholder="Search" data-testid="input" />
          </Sidebar>
        </SidebarProvider>
      );
      expect(screen.getByTestId('input')).toBeInTheDocument();
    });

    it('renders SidebarMenuSkeleton', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarMenuSkeleton showIcon data-testid="skeleton" />
          </Sidebar>
        </SidebarProvider>
      );
      expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    });
  });

  describe('SidebarMenuButton', () => {
    it('renders with isActive prop', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarMenuButton isActive data-testid="active-btn">
              Active
            </SidebarMenuButton>
          </Sidebar>
        </SidebarProvider>
      );
      expect(screen.getByTestId('active-btn')).toHaveAttribute('data-active', 'true');
    });

    it('renders with tooltip string', () => {
      render(
        <SidebarProvider defaultOpen={false}>
          <Sidebar>
            <SidebarMenuButton tooltip="My Tooltip" data-testid="tooltip-btn">
              Button
            </SidebarMenuButton>
          </Sidebar>
        </SidebarProvider>
      );
      expect(screen.getByTestId('tooltip-btn')).toBeInTheDocument();
    });

    it('renders size variants', () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarMenuButton size="sm" data-testid="sm">Small</SidebarMenuButton>
            <SidebarMenuButton size="lg" data-testid="lg">Large</SidebarMenuButton>
          </Sidebar>
        </SidebarProvider>
      );
      expect(screen.getByTestId('sm')).toHaveAttribute('data-size', 'sm');
      expect(screen.getByTestId('lg')).toHaveAttribute('data-size', 'lg');
    });
  });
});
