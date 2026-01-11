'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const healthCards = [
  { title: 'API Response Time', value: '145ms', status: 'healthy', trend: '↓ 12%' },
  { title: 'Error Rate', value: '0.02%', status: 'healthy', trend: '↓ 5%' },
  { title: 'Uptime', value: '99.99%', status: 'healthy', trend: '→' },
  { title: 'Active Users', value: '1,247', status: 'healthy', trend: '↑ 8%' },
  { title: 'CPU Usage', value: '42%', status: 'warning', trend: '↑ 15%' },
  { title: 'Memory Usage', value: '68%', status: 'warning', trend: '↑ 3%' },
  { title: 'Disk Usage', value: '55%', status: 'healthy', trend: '↑ 1%' },
  { title: 'Queue Depth', value: '23', status: 'healthy', trend: '↓ 40%' },
];

const statusColors: Record<string, string> = {
  healthy: 'bg-green-500',
  warning: 'bg-yellow-500',
  critical: 'bg-red-500',
};

export default function ProductionHealthPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Production Health Dashboard
          </h1>
          <p className="text-muted-foreground">Real-time system health monitoring</p>
        </div>
        <Badge variant="outline" className="text-green-500 border-green-500/30">● All Systems Operational</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {healthCards.map(card => (
          <Card key={card.title}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>{card.title}</CardDescription>
                <span className={`w-2 h-2 rounded-full ${statusColors[card.status]}`} />
              </div>
              <CardTitle className="text-2xl">{card.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <span className={`text-sm ${card.trend.includes('↑') ? 'text-red-500' : card.trend.includes('↓') ? 'text-green-500' : 'text-muted-foreground'}`}>
                {card.trend}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
