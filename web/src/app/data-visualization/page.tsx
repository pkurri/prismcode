'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const chartData = [
  { label: 'Mon', value: 65 }, { label: 'Tue', value: 78 }, { label: 'Wed', value: 82 },
  { label: 'Thu', value: 74 }, { label: 'Fri', value: 91 }, { label: 'Sat', value: 45 }, { label: 'Sun', value: 38 },
];

export default function DataVisualizationPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
        Data Visualization Studio
      </h1>

      <Tabs defaultValue="charts">
        <TabsList>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        <TabsContent value="charts">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Weekly Activity</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-48">
                  {chartData.map(d => (
                    <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-gradient-to-t from-violet-600 to-purple-400 rounded-t" style={{ height: `${d.value}%` }} />
                      <span className="text-xs text-muted-foreground">{d.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Performance</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[{ label: 'Build Time', value: 85 }, { label: 'Test Speed', value: 72 }, { label: 'Coverage', value: 28 }].map(m => (
                    <div key={m.label}>
                      <div className="flex justify-between text-sm mb-1"><span>{m.label}</span><span>{m.value}%</span></div>
                      <div className="h-2 bg-muted rounded-full"><div className="h-full bg-gradient-to-r from-violet-600 to-purple-600 rounded-full" style={{ width: `${m.value}%` }} /></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
