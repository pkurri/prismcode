'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface HealthMetric {
  id: string;
  name: string;
  value: number | string;
  unit?: string;
  status: 'healthy' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
  description?: string;
}

interface Service {
  id: string;
  name: string;
  status: 'operational' | 'degraded' | 'down';
  uptime: string;
  latency: number;
  lastIncident?: string;
}

interface Incident {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  startedAt: string;
  resolvedAt?: string;
  affectedServices: string[];
}

const mockMetrics: HealthMetric[] = [
  { id: '1', name: 'Uptime', value: 99.98, unit: '%', status: 'healthy', trend: 'stable', description: 'Last 30 days' },
  { id: '2', name: 'Response Time', value: 145, unit: 'ms', status: 'healthy', trend: 'down', description: 'P95 latency' },
  { id: '3', name: 'Error Rate', value: 0.02, unit: '%', status: 'healthy', trend: 'down', description: 'Last 24 hours' },
  { id: '4', name: 'Active Users', value: '1.2K', status: 'healthy', trend: 'up', description: 'Current sessions' },
  { id: '5', name: 'API Calls', value: '245K', status: 'healthy', trend: 'up', description: 'Last 24 hours' },
  { id: '6', name: 'CPU Usage', value: 42, unit: '%', status: 'healthy', trend: 'stable' },
  { id: '7', name: 'Memory', value: 68, unit: '%', status: 'warning', trend: 'up' },
  { id: '8', name: 'Disk', value: 55, unit: '%', status: 'healthy', trend: 'up' },
];

const mockServices: Service[] = [
  { id: 's1', name: 'API Server', status: 'operational', uptime: '99.99%', latency: 45 },
  { id: 's2', name: 'Web App', status: 'operational', uptime: '99.98%', latency: 120 },
  { id: 's3', name: 'Database', status: 'operational', uptime: '100%', latency: 12 },
  { id: 's4', name: 'Redis Cache', status: 'operational', uptime: '99.99%', latency: 2 },
  { id: 's5', name: 'Background Jobs', status: 'degraded', uptime: '99.5%', latency: 250, lastIncident: '2 hours ago' },
  { id: 's6', name: 'CDN', status: 'operational', uptime: '100%', latency: 25 },
];

const mockIncidents: Incident[] = [
  { id: 'i1', title: 'Elevated job queue latency', severity: 'medium', status: 'monitoring', startedAt: '2 hours ago', affectedServices: ['Background Jobs'] },
  { id: 'i2', title: 'Database connection spike', severity: 'low', status: 'resolved', startedAt: 'Yesterday', resolvedAt: '23 hours ago', affectedServices: ['Database', 'API Server'] },
];

const statusColors: Record<string, string> = {
  operational: 'bg-green-500',
  degraded: 'bg-amber-500',
  down: 'bg-red-500',
  healthy: 'text-green-500',
  warning: 'text-amber-500',
  critical: 'text-red-500',
};

const severityColors: Record<string, string> = {
  low: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  medium: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
  critical: 'bg-red-500/10 text-red-500 border-red-500/30',
};

export default function ProductionHealthPage() {
  const [metrics] = useState(mockMetrics);
  const [services] = useState(mockServices);
  const [incidents] = useState(mockIncidents);

  const allOperational = services.every(s => s.status === 'operational');
  const activeIncidents = incidents.filter(i => i.status !== 'resolved').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Production Health
          </h1>
          <p className="text-muted-foreground">Real-time system status and monitoring</p>
        </div>
        <Badge variant={allOperational ? 'default' : 'destructive'} className="text-lg px-4 py-2">
          {allOperational ? '✓ All Systems Operational' : `⚠️ ${activeIncidents} Active Incident${activeIncidents > 1 ? 's' : ''}`}
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {metrics.slice(0, 4).map(metric => (
          <Card key={metric.id}>
            <CardHeader className="pb-2">
              <CardDescription>{metric.name}</CardDescription>
              <CardTitle className={`text-3xl ${statusColors[metric.status]}`}>
                {metric.value}{metric.unit}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-xs">
                {metric.trend === 'up' && <span className="text-green-500">↑</span>}
                {metric.trend === 'down' && <span className="text-blue-500">↓</span>}
                {metric.trend === 'stable' && <span className="text-muted-foreground">→</span>}
                <span className="text-muted-foreground">{metric.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Services Status */}
        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
            <CardDescription>Current status of all services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {services.map(service => (
              <div key={service.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${statusColors[service.status]}`} />
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-xs text-muted-foreground">{service.uptime} uptime</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm">{service.latency}ms</p>
                  {service.lastIncident && (
                    <p className="text-xs text-amber-500">Incident {service.lastIncident}</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Incidents */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
            <CardDescription>Active and recent issues</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {incidents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No recent incidents 🎉</p>
            ) : (
              incidents.map(incident => (
                <div key={incident.id} className={`p-4 rounded-lg ${incident.status === 'resolved' ? 'bg-muted/30' : 'bg-amber-500/5 border border-amber-500/30'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className={severityColors[incident.severity]}>
                      {incident.severity}
                    </Badge>
                    <Badge variant={incident.status === 'resolved' ? 'secondary' : 'default'}>
                      {incident.status}
                    </Badge>
                  </div>
                  <h4 className="font-medium">{incident.title}</h4>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span>Started: {incident.startedAt}</span>
                    {incident.resolvedAt && (
                      <>
                        <span>•</span>
                        <span>Resolved: {incident.resolvedAt}</span>
                      </>
                    )}
                  </div>
                  <div className="flex gap-1 mt-2">
                    {incident.affectedServices.map(s => (
                      <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Resources */}
      <Card>
        <CardHeader>
          <CardTitle>System Resources</CardTitle>
          <CardDescription>Infrastructure health metrics</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          {metrics.slice(4).map(metric => (
            <div key={metric.id} className="p-4 rounded-lg bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{metric.name}</span>
                <span className={statusColors[metric.status]}>{metric.value}{metric.unit}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${metric.status === 'healthy' ? 'bg-green-500' : metric.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${typeof metric.value === 'number' ? metric.value : 50}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
