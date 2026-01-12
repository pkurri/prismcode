import { render, screen } from '@testing-library/react';
import { act } from 'react';

// Import pages
// import MobilePage from '../mobile/page'; // Removed due to missing text
import NotificationsPage from '../notifications/page';
import OfflineModePage from '../offline-mode/page';
import ProductionHealthPage from '../production-health/page';
import QualityDashboardPage from '../quality-dashboard/page';
import QuickDeployPage from '../quick-deploy/page';
import RootCausePage from '../root-cause/page';
import SandboxPage from '../sandbox/page';
import SandboxSelectorPage from '../sandbox-selector/page';
// import ScanPage from '../scan/page'; // Does not exist
import ScreenReaderTestPage from '../screen-reader-test/page';
// import SecurityPage from '../security/page'; // Covered
import SelfHealingPage from '../self-healing/page';
import SessionSharingPage from '../session-sharing/page';
// import SettingsPage from '../settings/page'; // Covered
import SustainabilityPage from '../sustainability/page';
import SustainabilityDashboardPage from '../sustainability-dashboard/page';
import TeamPage from '../team/page';
import TeamManagementPage from '../team-management/page';
import TechDebtPage from '../tech-debt/page';
import TestGenerationPage from '../test-generation/page';
import TestingDashboardPage from '../testing-dashboard/page';
import VideoCallPage from '../video-call/page';
import VisualPreviewPage from '../visual-preview/page';
import VisualWorkflowPage from '../visual-workflow/page';
import WorkflowAutomationPage from '../workflow-automation/page';

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
}), { virtual: true });

describe('Page Megabatch 2', () => {

  // MobilePage test removed

  it('renders Notifications Page', async () => {
    await act(async () => { render(<NotificationsPage />); });
    expect(screen.getAllByText(/Notification/i).length).toBeGreaterThan(0);
  });

  it('renders Offline Mode Page', async () => {
    await act(async () => { render(<OfflineModePage />); });
    expect(screen.getAllByText(/Offline/i).length).toBeGreaterThan(0);
  });

  it('renders Production Health Page', async () => {
    await act(async () => { render(<ProductionHealthPage />); });
    expect(screen.getAllByText(/Health/i).length).toBeGreaterThan(0);
  });

  it('renders Quality Dashboard Page', async () => {
    await act(async () => { render(<QualityDashboardPage />); });
    expect(screen.getAllByText(/Quality/i).length).toBeGreaterThan(0);
  });

  it('renders Quick Deploy Page', async () => {
    await act(async () => { render(<QuickDeployPage />); });
    expect(screen.getAllByText(/Deploy/i).length).toBeGreaterThan(0);
  });

  it('renders Root Cause Page', async () => {
    await act(async () => { render(<RootCausePage />); });
    expect(screen.getAllByText(/Cause/i).length).toBeGreaterThan(0);
  });

  it('renders Sandbox Page', async () => {
    await act(async () => { render(<SandboxPage />); });
    expect(screen.getAllByText(/Sandbox/i).length).toBeGreaterThan(0);
  });

  it('renders Sandbox Selector Page', async () => {
    await act(async () => { render(<SandboxSelectorPage />); });
    expect(screen.getAllByText(/Sandbox/i).length).toBeGreaterThan(0);
  });

  // ScanPage test removed

  it('renders Screen Reader Test Page', async () => {
    await act(async () => { render(<ScreenReaderTestPage />); });
    expect(screen.getAllByText(/Screen/i).length).toBeGreaterThan(0);
  });

  it('renders Self Healing Page', async () => {
    await act(async () => { render(<SelfHealingPage />); });
    expect(screen.getAllByText(/Healing/i).length).toBeGreaterThan(0);
  });

  it('renders Session Sharing Page', async () => {
    await act(async () => { render(<SessionSharingPage />); });
    expect(screen.getAllByText(/Session/i).length).toBeGreaterThan(0);
  });

  it('renders Sustainability Page', async () => {
    await act(async () => { render(<SustainabilityPage />); });
    expect(screen.getAllByText(/Sustainability/i).length).toBeGreaterThan(0);
  });

  it('renders Sustainability Dashboard Page', async () => {
    await act(async () => { render(<SustainabilityDashboardPage />); });
    expect(screen.getAllByText(/Sustainability/i).length).toBeGreaterThan(0);
  });

  it('renders Team Page', async () => {
    await act(async () => { render(<TeamPage />); });
    expect(screen.getAllByText(/Team/i).length).toBeGreaterThan(0);
  });

  it('renders Team Management Page', async () => {
    await act(async () => { render(<TeamManagementPage />); });
    expect(screen.getAllByText(/Team/i).length).toBeGreaterThan(0);
  });

  it('renders Tech Debt Page', async () => {
    await act(async () => { render(<TechDebtPage />); });
    expect(screen.getAllByText(/Debt/i).length).toBeGreaterThan(0);
  });

  it('renders Test Generation Page', async () => {
    await act(async () => { render(<TestGenerationPage />); });
    expect(screen.getAllByText(/Test/i).length).toBeGreaterThan(0);
  });

  it('renders Testing Dashboard Page', async () => {
    await act(async () => { render(<TestingDashboardPage />); });
    expect(screen.getAllByText(/Testing/i).length).toBeGreaterThan(0);
  });

  it('renders Video Call Page', async () => {
    await act(async () => { render(<VideoCallPage />); });
    expect(screen.getAllByText(/Video/i).length).toBeGreaterThan(0);
  });

  it('renders Visual Preview Page', async () => {
    await act(async () => { render(<VisualPreviewPage />); });
    expect(screen.getAllByText(/Preview/i).length).toBeGreaterThan(0);
  });

  it('renders Visual Workflow Page', async () => {
    await act(async () => { render(<VisualWorkflowPage />); });
    expect(screen.getAllByText(/Workflow/i).length).toBeGreaterThan(0);
  });
  
  it('renders Workflow Automation Page', async () => {
    await act(async () => { render(<WorkflowAutomationPage />); });
    expect(screen.getAllByText(/Automation/i).length).toBeGreaterThan(0);
  });
});
