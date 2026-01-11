'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SustainabilityMetric {
  label: string;
  value: number | string;
  unit?: string;
  trend: 'up' | 'down' | 'stable';
  isGood: boolean;
}

interface TeamMember {
  name: string;
  score: number;
  co2Saved: number;
  rank: number;
}

interface TrendPoint {
  month: string;
  co2: number;
  energy: number;
}

const mockMetrics: SustainabilityMetric[] = [
  { label: 'Monthly CO₂', value: 2.4, unit: 'kg', trend: 'down', isGood: true },
  { label: 'Green Score', value: 'B+', trend: 'up', isGood: true },
  { label: 'Energy Saved', value: 18, unit: '%', trend: 'up', isGood: true },
  { label: 'Optimizations', value: 45, trend: 'up', isGood: true },
];

const mockLeaderboard: TeamMember[] = [
  { name: 'Sarah Chen', score: 92, co2Saved: 450, rank: 1 },
  { name: 'Alex Thompson', score: 88, co2Saved: 380, rank: 2 },
  { name: 'Jordan Rivera', score: 85, co2Saved: 320, rank: 3 },
  { name: 'Taylor Kim', score: 78, co2Saved: 260, rank: 4 },
  { name: 'Morgan Lee', score: 72, co2Saved: 210, rank: 5 },
];

const mockTrends: TrendPoint[] = [
  { month: 'Jul', co2: 3.8, energy: 12 },
  { month: 'Aug', co2: 3.5, energy: 11 },
  { month: 'Sep', co2: 3.2, energy: 10.5 },
  { month: 'Oct', co2: 2.9, energy: 9.5 },
  { month: 'Nov', co2: 2.6, energy: 8.5 },
  { month: 'Dec', co2: 2.4, energy: 7.8 },
];

export default function SustainabilityDashboardPage() {
  const [metrics] = useState(mockMetrics);
  const [leaderboard] = useState(mockLeaderboard);
  const [trends] = useState(mockTrends);

  const co2Reduction = ((3.8 - 2.4) / 3.8 * 100).toFixed(0);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Sustainability Dashboard
          </h1>
          <p className="text-muted-foreground">Track your team's environmental impact</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">📊 Export Report</Button>
          <Button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            🌱 Share Impact
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map((m, i) => (
          <Card key={i} className={i === 0 ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30' : ''}>
            <CardHeader className="pb-2">
              <CardDescription>{m.label}</CardDescription>
              <CardTitle className={`text-3xl ${m.isGood ? 'text-green-500' : 'text-amber-500'}`}>
                {m.value}{m.unit}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className={`text-xs ${m.isGood ? 'text-green-500' : 'text-red-500'}`}>
                {m.trend === 'up' ? '↑' : m.trend === 'down' ? '↓' : '→'} {m.isGood ? 'Improving' : 'Needs attention'}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Impact Banner */}
      <Card className="bg-gradient-to-r from-green-600/10 to-emerald-600/10 border-green-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">🌍 Great Progress!</h3>
              <p className="text-muted-foreground">Your team reduced CO₂ emissions by {co2Reduction}% this quarter</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-green-500">🌲 12</p>
              <p className="text-sm text-muted-foreground">Trees worth of CO₂ saved</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="repos">By Repository</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Carbon Trend</CardTitle>
              <CardDescription>Monthly CO₂ emissions (kg)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-end justify-between gap-4">
                {trends.map((t, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t"
                      style={{ height: `${(t.co2 / 4) * 150}px` }}
                    />
                    <span className="text-xs text-muted-foreground">{t.month}</span>
                    <span className="text-sm font-medium">{t.co2}kg</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle>🏆 Green Champions</CardTitle>
              <CardDescription>Top contributors to sustainability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {leaderboard.map(member => (
                <div key={member.rank} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      member.rank === 1 ? 'bg-amber-500 text-white' :
                      member.rank === 2 ? 'bg-gray-400 text-white' :
                      member.rank === 3 ? 'bg-amber-700 text-white' : 'bg-muted'
                    }`}>
                      {member.rank <= 3 ? ['🥇', '🥈', '🥉'][member.rank - 1] : member.rank}
                    </span>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.co2Saved}g CO₂ saved</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-500">{member.score} pts</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repos">
          <Card>
            <CardHeader>
              <CardTitle>Repository Impact</CardTitle>
              <CardDescription>Carbon footprint by project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { repo: 'prismcode/web', rating: 'B+', co2: 1.2 },
                { repo: 'prismcode/api', rating: 'A', co2: 0.5 },
                { repo: 'prismcode/mobile', rating: 'B', co2: 0.7 },
              ].map((repo, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded bg-green-500 text-white flex items-center justify-center font-bold">
                      {repo.rating}
                    </span>
                    <span className="font-mono">{repo.repo}</span>
                  </div>
                  <span>{repo.co2} kg/month</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
