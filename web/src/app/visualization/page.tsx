'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

type WidgetType = 'line' | 'bar' | 'area' | 'pie' | 'kpi' | 'table';

interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  dataSource: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: number;
  lastUpdated: string;
  shared: boolean;
}

const widgetTypes: { type: WidgetType; name: string; icon: string; desc: string }[] = [
  { type: 'line', name: 'Line Chart', icon: '📈', desc: 'Trends over time' },
  { type: 'bar', name: 'Bar Chart', icon: '📊', desc: 'Compare categories' },
  { type: 'area', name: 'Area Chart', icon: '📉', desc: 'Cumulative data' },
  { type: 'pie', name: 'Pie Chart', icon: '🥧', desc: 'Distribution' },
  { type: 'kpi', name: 'KPI Card', icon: '🎯', desc: 'Key metrics' },
  { type: 'table', name: 'Data Table', icon: '📋', desc: 'Detailed rows' },
];

const dataSources = [
  { id: 'issues', name: 'GitHub Issues', icon: '🎫', fields: ['count', 'status', 'priority', 'assignee'] },
  { id: 'tests', name: 'Test Results', icon: '🧪', fields: ['passed', 'failed', 'coverage', 'duration'] },
  { id: 'deploys', name: 'Deployments', icon: '🚀', fields: ['success', 'failures', 'rollbacks', 'time'] },
  { id: 'agents', name: 'Agent Metrics', icon: '🤖', fields: ['tasks', 'accuracy', 'latency', 'cost'] },
  { id: 'commits', name: 'Git Activity', icon: '📝', fields: ['commits', 'authors', 'additions', 'deletions'] },
];

const savedDashboards: Dashboard[] = [
  { id: '1', name: 'Delivery Overview', description: 'Sprints, velocity, and team performance', widgets: 6, lastUpdated: '2 hours ago', shared: true },
  { id: '2', name: 'Quality Metrics', description: 'Test coverage, bugs, and flaky tests', widgets: 4, lastUpdated: '1 day ago', shared: true },
  { id: '3', name: 'Agent Performance', description: 'AI agent accuracy and efficiency', widgets: 5, lastUpdated: '3 days ago', shared: false },
];

const mockWidgets: Widget[] = [
  { id: '1', type: 'kpi', title: 'Open Issues', dataSource: 'issues', x: 0, y: 0, width: 1, height: 1 },
  { id: '2', type: 'kpi', title: 'Test Pass Rate', dataSource: 'tests', x: 1, y: 0, width: 1, height: 1 },
  { id: '3', type: 'kpi', title: 'Deploy Success', dataSource: 'deploys', x: 2, y: 0, width: 1, height: 1 },
  { id: '4', type: 'kpi', title: 'Agent Tasks', dataSource: 'agents', x: 3, y: 0, width: 1, height: 1 },
  { id: '5', type: 'line', title: 'Issues Over Time', dataSource: 'issues', x: 0, y: 1, width: 2, height: 2 },
  { id: '6', type: 'bar', title: 'Test Results by Suite', dataSource: 'tests', x: 2, y: 1, width: 2, height: 2 },
];

const mockChartData = {
  line: [
    { name: 'Mon', value: 12 },
    { name: 'Tue', value: 19 },
    { name: 'Wed', value: 15 },
    { name: 'Thu', value: 22 },
    { name: 'Fri', value: 18 },
    { name: 'Sat', value: 8 },
    { name: 'Sun', value: 5 },
  ],
  bar: [
    { name: 'Unit', passed: 245, failed: 2 },
    { name: 'Integration', passed: 58, failed: 1 },
    { name: 'E2E', passed: 34, failed: 3 },
    { name: 'Visual', passed: 12, failed: 0 },
  ],
};

export default function VisualizationPage() {
  const [activeTab, setActiveTab] = useState('builder');
  const [widgets, setWidgets] = useState(mockWidgets);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [draggedType, setDraggedType] = useState<WidgetType | null>(null);

  const handleDragStart = (type: WidgetType) => {
    setDraggedType(type);
  };

  const renderKPIWidget = (widget: Widget) => (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="text-4xl font-bold text-foreground">
        {widget.title === 'Open Issues' ? '24' : 
         widget.title === 'Test Pass Rate' ? '99.1%' :
         widget.title === 'Deploy Success' ? '98%' : '156'}
      </div>
      <p className="text-sm text-muted-foreground mt-1">{widget.title}</p>
      <Badge variant="secondary" className="mt-2 text-green-600 bg-green-500/10">
        +12%
      </Badge>
    </div>
  );

  const renderLineChart = (_widget: Widget) => (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex items-end gap-1 px-4 pb-4">
        {mockChartData.line.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div 
              className="w-full bg-gradient-to-t from-violet-600 to-purple-500 rounded-t"
              style={{ height: `${(d.value / 25) * 100}%`, minHeight: 4 }}
            />
            <span className="text-xs text-muted-foreground">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBarChart = (_widget: Widget) => (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex items-end gap-2 px-4 pb-4">
        {mockChartData.bar.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex gap-0.5">
              <div 
                className="flex-1 bg-green-500 rounded-t"
                style={{ height: `${(d.passed / 250) * 120}px` }}
              />
              <div 
                className="flex-1 bg-red-500 rounded-t"
                style={{ height: `${(d.failed / 250) * 120}px`, minHeight: d.failed > 0 ? 4 : 0 }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderWidget = (widget: Widget) => {
    switch (widget.type) {
      case 'kpi':
        return renderKPIWidget(widget);
      case 'line':
      case 'area':
        return renderLineChart(widget);
      case 'bar':
        return renderBarChart(widget);
      default:
        return <div className="h-full flex items-center justify-center text-muted-foreground">Widget Preview</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Data Visualization Studio
          </h1>
          <p className="text-muted-foreground mt-1">
            Build custom dashboards with drag-and-drop widgets
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Import</Button>
          <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
            New Dashboard
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="builder">Dashboard Builder</TabsTrigger>
          <TabsTrigger value="dashboards">My Dashboards</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Widget Palette */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Widgets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {widgetTypes.map((w) => (
                  <div
                    key={w.type}
                    draggable
                    onDragStart={() => handleDragStart(w.type)}
                    className="p-3 rounded-lg border border-border/50 bg-muted/30 cursor-grab hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{w.icon}</span>
                      <div>
                        <p className="text-sm font-medium">{w.name}</p>
                        <p className="text-xs text-muted-foreground">{w.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}

                <Separator className="my-4" />

                <h4 className="text-sm font-medium mb-2">Data Sources</h4>
                {dataSources.map((ds) => (
                  <div
                    key={ds.id}
                    className="p-2 rounded-lg border border-border/50 bg-background cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>{ds.icon}</span>
                      <span className="text-sm">{ds.name}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Canvas */}
            <Card className="lg:col-span-4">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base">Dashboard Canvas</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Undo</Button>
                  <Button variant="outline" size="sm">Redo</Button>
                  <Button variant="outline" size="sm">Preview</Button>
                  <Button size="sm" className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                    Save Dashboard
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative min-h-[500px] bg-muted/20 rounded-lg border-2 border-dashed border-border p-4">
                  {/* Grid of Widgets */}
                  <div className="grid grid-cols-4 gap-4 auto-rows-[120px]">
                    {widgets.map((widget) => (
                      <div
                        key={widget.id}
                        onClick={() => setSelectedWidget(widget.id)}
                        className={`
                          rounded-lg border bg-card shadow-sm cursor-pointer transition-all
                          ${widget.width === 2 ? 'col-span-2' : ''}
                          ${widget.height === 2 ? 'row-span-2' : ''}
                          ${selectedWidget === widget.id ? 'ring-2 ring-primary' : 'hover:shadow-md'}
                        `}
                      >
                        <div className="h-full flex flex-col">
                          <div className="px-3 pt-2 pb-1 flex items-center justify-between">
                            <h3 className="text-xs font-medium text-muted-foreground truncate">
                              {widget.title}
                            </h3>
                            <Badge variant="secondary" className="text-[10px]">
                              {widget.dataSource}
                            </Badge>
                          </div>
                          <div className="flex-1 overflow-hidden">
                            {renderWidget(widget)}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Add Widget Placeholder */}
                    <div className="rounded-lg border-2 border-dashed border-border/50 bg-muted/10 flex items-center justify-center cursor-pointer hover:bg-muted/20 transition-colors">
                      <div className="text-center text-muted-foreground">
                        <span className="text-2xl">+</span>
                        <p className="text-xs mt-1">Add Widget</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dashboards" className="mt-4">
          <div className="grid gap-4">
            {savedDashboards.map((dashboard) => (
              <Card key={dashboard.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                      <span className="text-2xl">📊</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{dashboard.name}</h3>
                        {dashboard.shared && (
                          <Badge variant="secondary" className="text-xs">Shared</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {dashboard.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {dashboard.widgets} widgets · Updated {dashboard.lastUpdated}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">Share</Button>
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button size="sm" className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Delivery Dashboard', desc: 'Track sprints, velocity, and team performance', icon: '🚀' },
              { name: 'Quality Dashboard', desc: 'Monitor tests, coverage, and code quality', icon: '🧪' },
              { name: 'Agent Performance', desc: 'AI agent metrics and task completion', icon: '🤖' },
              { name: 'DevOps Overview', desc: 'Deployments, uptime, and infrastructure', icon: '⚙️' },
              { name: 'Cost Analytics', desc: 'AI API usage and cost optimization', icon: '💰' },
              { name: 'Team Insights', desc: 'Contributions, reviews, and collaboration', icon: '👥' },
            ].map((template, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">{template.icon}</div>
                  <h3 className="font-semibold mb-1">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{template.desc}</p>
                  <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
