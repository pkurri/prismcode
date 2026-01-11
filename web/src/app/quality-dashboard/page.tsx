'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

export default function QualityDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Quality Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">
            Centralized insights into code quality, testing stability, and security posture.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export Report</Button>
          <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
            Run Analysis
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Quality Rating', value: 'A-', trend: '+0.5', status: 'success', desc: 'Maintainability Index' },
          { title: 'Test Stability', value: '94%', trend: '-2%', status: 'warning', desc: 'Flaky Ratio: 1.2%' },
          { title: 'Security Score', value: '98/100', trend: '0', status: 'success', desc: '0 Critical Vulnerabilities' },
          { title: 'Tech Debt', value: '12d', trend: '-2d', status: 'success', desc: 'Est. Remediation Time' },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-3xl font-bold">{stat.value}</span>
                <Badge variant={stat.status === 'success' ? 'default' : 'secondary'} className={stat.status === 'warning' ? 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20' : ''}>
                  {stat.trend}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tests">Test Health</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="complexity">Complexity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Code Reviews</CardTitle>
                <CardDescription>AI-generated insights from recent PRs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { pr: '#342 Auth Flow', score: 'B+', issues: 2, author: 'Alice' },
                    { pr: '#341 API Optimization', score: 'A', issues: 0, author: 'Bob' },
                    { pr: '#340 Mobile Fixes', score: 'A-', issues: 1, author: 'Charlie' },
                    { pr: '#339 Database Schema', score: 'C', issues: 5, author: 'Dave' },
                  ].map((review, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                      <div>
                        <p className="font-medium text-sm">{review.pr}</p>
                        <p className="text-xs text-muted-foreground">by {review.author}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{review.issues} issues</p>
                        </div>
                        <Badge className={`w-8 h-8 flex items-center justify-center rounded-full ${
                          review.score.startsWith('A') ? 'bg-green-500' :
                          review.score.startsWith('B') ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}>
                          {review.score}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Problematic Hotspots</CardTitle>
                <CardDescription>Files with highest complexity and churn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { file: 'src/core/Authentication.ts', risk: 'High', complexity: 24, churn: 'High' },
                    { file: 'src/utils/LegacyParser.js', risk: 'Medium', complexity: 18, churn: 'Low' },
                    { file: 'src/api/BillingController.go', risk: 'High', complexity: 32, churn: 'Medium' },
                  ].map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🔥</span>
                        <div>
                          <p className="font-medium text-sm">{file.file}</p>
                          <p className="text-xs text-muted-foreground">Cyclomatic Complexity: {file.complexity}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-red-500 border-red-200">
                        {file.risk} Risk
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Other tabs would be implemented similarly */}
      </Tabs>
    </div>
  );
}
