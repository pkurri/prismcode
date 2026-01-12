import { render, screen } from '@testing-library/react';
import { act } from 'react';

// Import pages
import AccessibilityPage from '../accessibility/page';
import ActivityPage from '../activity/page';
import AssistantPage from '../assistant/page';
import AutoFixPage from '../auto-fix/page';
import AutoPrPage from '../auto-pr/page';
import CarbonPage from '../carbon-analyzer/page';
import CompliancePage from '../compliance/page';
import DashboardsPage from '../dashboards/page';
import DebugMemoryPage from '../debug-memory/page';
// import DebtForecastPage from '../debt-forecast/page'; // Already covered
import GreenCiPage from '../green-ci/page';
import GreenSuggestionsPage from '../green-suggestions/page';
import HealthPage from '../health/page';
import InfrastructurePage from '../infrastructure/page';
// import KnowledgeGraphPage from '../knowledge-graph/page'; // Already covered
import LeaderboardsPage from '../leaderboards/page';
import LiveDebugPage from '../live-debug/page';
import LivePlaygroundPage from '../live-playground/page';
import LiveSessionPage from '../live-session/page';
import LocalModelsPage from '../local-models/page';

// Mock generic components
jest.mock('@/components/ui/sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar" />,
  SidebarProvider: ({ children }: any) => <div>{children}</div>,
  SidebarTrigger: () => <button>Toggle</button>,
}), { virtual: true });

jest.mock('@/components/ui/chart', () => ({
  Chart: () => <div>Chart</div>,
  ChartContainer: ({ children }: any) => <div>{children}</div>,
  ChartTooltip: () => <div>Tooltip</div>,
  ChartTooltipContent: () => <div>Content</div>,
  ChartLegend: () => <div>Legend</div>,
  ChartLegendContent: () => <div>LegendContent</div>,
}), { virtual: true });

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  AreaChart: () => <div>AreaChart</div>,
  BarChart: () => <div>BarChart</div>,
  LineChart: () => <div>LineChart</div>,
  PieChart: () => <div>PieChart</div>,
  Area: () => <div>Area</div>,
  Bar: () => <div>Bar</div>,
  Line: () => <div>Line</div>,
  Pie: () => <div>Pie</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  CartesianGrid: () => <div>Grid</div>,
  Tooltip: () => <div>Tooltip</div>,
  Legend: () => <div>Legend</div>,
  Cell: () => <div>Cell</div>,
  // D3 mocks
  scaleLinear: () => ({ domain: () => ({ range: () => {} }) }),
  scaleOrdinal: () => ({ domain: () => ({ range: () => {} }) }),
  schemeCategory10: [],
}), { virtual: true });

// Mock d3 separately just in case
jest.mock('d3', () => ({
  select: () => ({
    append: () => ({
      attr: () => ({ style: () => ({}) }),
    }),
    selectAll: () => ({
      data: () => ({
        join: () => ({
          attr: () => ({
            call: () => {},
            on: () => {},
            transition: () => ({ duration: () => ({ attr: () => {} }) }),
          }),
        }),
      }),
    }),
  }),
  zoom: () => ({ on: () => {} }),
  zoomIdentity: {},
  drag: () => ({ on: () => {} }),
  forceSimulation: () => ({
    force: () => ({ id: () => {} }),
    on: () => {},
    alpha: () => {},
    restart: () => {},
    nodes: () => ({ on: () => {} }),
    links: () => ({ id: () => {} }),
  }),
  forceLink: () => ({ id: () => {} }),
  forceManyBody: () => {},
  forceCenter: () => {},
  scaleLinear: () => ({ domain: () => ({ range: () => {} }) }),
  scaleOrdinal: () => ({ domain: () => ({ range: () => {} }) }),
  schemeCategory10: [],
}), { virtual: true });

describe('Page Megabatch 1', () => {
    
  it('renders Accessibility Page', async () => {
    await act(async () => { render(<AccessibilityPage />); });
    expect(screen.getAllByText(/Accessibility/i).length).toBeGreaterThan(0);
  });

  it('renders Activity Page', async () => {
    await act(async () => { render(<ActivityPage />); });
    expect(screen.getAllByText(/Activity/i).length).toBeGreaterThan(0);
  });

  it('renders Assistant Page', async () => {
    await act(async () => { render(<AssistantPage />); });
    expect(screen.getAllByText(/Assistant/i).length).toBeGreaterThan(0);
  });

  it('renders AutoFix Page', async () => {
    await act(async () => { render(<AutoFixPage />); });
    expect(screen.getAllByText(/Fix/i).length).toBeGreaterThan(0); // Loose match
  });

  it('renders AutoPr Page', async () => {
    await act(async () => { render(<AutoPrPage />); });
    expect(screen.getAllByText(/PR/i).length).toBeGreaterThan(0);
  });

  it('renders Carbon Page', async () => {
    await act(async () => { render(<CarbonPage />); });
    expect(screen.getAllByText(/Carbon/i).length).toBeGreaterThan(0);
  });

  it('renders Compliance Page', async () => {
    await act(async () => { render(<CompliancePage />); });
    expect(screen.getAllByText(/Compliance/i).length).toBeGreaterThan(0);
  });

  it('renders Dashboards Page', async () => {
    await act(async () => { render(<DashboardsPage />); });
    expect(screen.getAllByText(/Dashboard/i).length).toBeGreaterThan(0);
  });

  it('renders Debug Memory Page', async () => {
    await act(async () => { render(<DebugMemoryPage />); });
    expect(screen.getAllByText(/Memory/i).length).toBeGreaterThan(0);
  });

  it('renders Green CI Page', async () => {
    await act(async () => { render(<GreenCiPage />); });
    expect(screen.getAllByText(/Green/i).length).toBeGreaterThan(0);
  });

  it('renders Green Suggestions Page', async () => {
    await act(async () => { render(<GreenSuggestionsPage />); });
    expect(screen.getAllByText(/Suggestions/i).length).toBeGreaterThan(0);
  });

  it('renders Health Page', async () => {
    await act(async () => { render(<HealthPage />); });
    expect(screen.getAllByText(/Health/i).length).toBeGreaterThan(0);
  });

  it('renders Infrastructure Page', async () => {
    await act(async () => { render(<InfrastructurePage />); });
    expect(screen.getAllByText(/Infrastructure/i).length).toBeGreaterThan(0);
  });
  
  it('renders Leaderboards Page', async () => {
    await act(async () => { render(<LeaderboardsPage />); });
    expect(screen.getAllByText(/Leaderboard/i).length).toBeGreaterThan(0);
  });

  it('renders Live Debug Page', async () => {
    await act(async () => { render(<LiveDebugPage />); });
    expect(screen.getAllByText(/Debug/i).length).toBeGreaterThan(0);
  });

  it('renders Live Playground Page', async () => {
    await act(async () => { render(<LivePlaygroundPage />); });
    expect(screen.getAllByText(/Playground/i).length).toBeGreaterThan(0);
  });

  it('renders Live Session Page', async () => {
    await act(async () => { render(<LiveSessionPage />); });
    expect(screen.getAllByText(/Live/i).length).toBeGreaterThan(0);
  });

  it('renders Local Models Page', async () => {
    await act(async () => { render(<LocalModelsPage />); });
    expect(screen.getAllByText(/Models/i).length).toBeGreaterThan(0);
  });
});
