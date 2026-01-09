'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const widgets = [
  { id: 1, type: 'kpi', title: 'Total PRs', value: '234', change: '+12%', color: 'violet' },
  { id: 2, type: 'kpi', title: 'Code Coverage', value: '87%', change: '+3%', color: 'green' },
  { id: 3, type: 'kpi', title: 'Tech Debt', value: '12.4h', change: '-8%', color: 'yellow' },
  { id: 4, type: 'kpi', title: 'Build Time', value: '4.2m', change: '-15%', color: 'blue' },
];

const chartData = {
  issues: [
    { month: 'Jan', open: 45, closed: 38 },
    { month: 'Feb', open: 52, closed: 49 },
    { month: 'Mar', open: 38, closed: 45 },
    { month: 'Apr', open: 41, closed: 52 },
    { month: 'May', open: 35, closed: 48 },
    { month: 'Jun', open: 28, closed: 42 },
  ],
  deployments: [
    { week: 'W1', success: 12, failed: 2 },
    { week: 'W2', success: 15, failed: 1 },
    { week: 'W3', success: 18, failed: 0 },
    { week: 'W4', success: 14, failed: 3 },
  ],
};

const templates = [
  { id: 'delivery', name: 'Delivery Dashboard', desc: 'PRs, deployments, velocity', widgets: 8 },
  { id: 'quality', name: 'Quality Dashboard', desc: 'Coverage, bugs, tech debt', widgets: 6 },
  { id: 'agent', name: 'Agent Performance', desc: 'AI usage, success rates', widgets: 5 },
];

export default function DashboardBuilderPage() {
  const [activeTab, setActiveTab] = useState('builder');
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);

  const widgetPalette = [
    { type: 'kpi', icon: '📊', name: 'KPI Card' },
    { type: 'line', icon: '📈', name: 'Line Chart' },
    { type: 'bar', icon: '📊', name: 'Bar Chart' },
    { type: 'pie', icon: '🥧', name: 'Pie Chart' },
    { type: 'table', icon: '📋', name: 'Data Table' },
    { type: 'area', icon: '📉', name: 'Area Chart' },
  ];

  return (
    <div className="space-y-6">
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
          <Button variant="outline">Export</Button>
          <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
            Save Dashboard
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="builder">Dashboard Builder</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="saved">My Dashboards</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Widget Palette */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Widgets</CardTitle>
              <CardDescription>Drag to canvas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {widgetPalette.map((w) => (
                <div
                  key={w.type}
                  draggable
                  className={`p-3 rounded-lg border cursor-grab hover:shadow-sm transition-all hover:border-primary ${selectedWidget === w.type ? 'border-primary bg-primary/5' : 'border-border'}`}
                  onClick={() => setSelectedWidget(w.type)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{w.icon}</span>
                    <span className="text-sm font-medium">{w.name}</span>
                  </div>
                </div>
              ))}
              <Separator className="my-4" />
              <h4 className="text-xs font-medium text-muted-foreground mb-2">DATA SOURCES</h4>
              {['Issues', 'Tests', 'Deployments', 'Agents', 'Coverage'].map((src) => (
                <Badge key={src} variant="secondary" className="mr-1 mb-1">
                  {src}
                </Badge>
              ))}
            </CardContent>
          </Card>

          {/* Canvas */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Dashboard Canvas</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Grid: 12 cols
                </Button>
                <Button variant="outline" size="sm">
                  Preview
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* KPI Row */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                {widgets.map((w) => (
                  <div
                    key={w.id}
                    className={`p-4 rounded-lg border-2 border-dashed cursor-move hover:border-primary transition-colors bg-gradient-to-br from-${w.color}-500/5 to-${w.color}-500/10`}
                  >
                    <p className="text-xs text-muted-foreground">{w.title}</p>
                    <p className="text-2xl font-bold mt-1">{w.value}</p>
                    <Badge
                      variant="secondary"
                      className={`text-xs mt-2 ${w.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {w.change}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border-2 border-dashed hover:border-primary transition-colors min-h-[200px]">
                  <p className="text-sm font-medium mb-3">Issues Trend</p>
                  <div className="flex items-end gap-2 h-32">
                    {chartData.issues.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col gap-1">
                        <div
                          className="bg-green-500 rounded-t"
                          style={{ height: `${d.closed * 2}px` }}
                        />
                        <div
                          className="bg-red-500 rounded-t"
                          style={{ height: `${d.open * 1.5}px` }}
                        />
                        <span className="text-[10px] text-center text-muted-foreground">
                          {d.month}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-2 text-xs">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded" />
                      Closed
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-red-500 rounded" />
                      Open
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-lg border-2 border-dashed hover:border-primary transition-colors min-h-[200px]">
                  <p className="text-sm font-medium mb-3">Deployments</p>
                  <div className="flex items-end gap-4 h-32">
                    {chartData.deployments.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex flex-col gap-0.5">
                          <div
                            className="bg-green-500 rounded"
                            style={{ height: `${d.success * 6}px` }}
                          />
                          {d.failed > 0 && (
                            <div
                              className="bg-red-500 rounded"
                              style={{ height: `${d.failed * 10}px` }}
                            />
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{d.week}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drop Zone */}
              <div className="mt-4 p-8 rounded-lg border-2 border-dashed border-muted text-center text-muted-foreground">
                <p className="text-sm">Drag widgets here to add more</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((t) => (
            <Card key={t.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base">{t.name}</CardTitle>
                <CardDescription>{t.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{t.widgets} widgets</Badge>
                  <Button size="sm">Use Template</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'saved' && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No saved dashboards yet</p>
            <Button className="mt-4" variant="outline">
              Create Your First Dashboard
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
