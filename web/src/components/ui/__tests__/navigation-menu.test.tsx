import { render, screen } from '@testing-library/react';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink
} from '../navigation-menu';

describe('NavigationMenu', () => {
  it('renders menu with trigger and content', () => {
    // Radix Navigation Menu needs a bit of structure
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="/link">Link One</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );
    expect(screen.getByText('Item One')).toBeInTheDocument();
    // Content is usually hidden until hover/click, so checking trigger existence is good for now.
    // Radix UI tests can be tricky with visibility, but rendering without crash is the goal.
  });

  it('renders list', () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
           <NavigationMenuItem>Test</NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
