'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const testStats = { passed: 285, failed: 0, skipped: 0, coverage: 28.5 };

export default function TestingDashboardPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
        Testing & Quality Dashboard
      </h1>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle className="text-green-500">{testStats.passed}</CardTitle><CardDescription>Passed</CardDescription></CardHeader></Card>
        <Card><CardHeader><CardTitle className="text-red-500">{testStats.failed}</CardTitle><CardDescription>Failed</CardDescription></CardHeader></Card>
        <Card><CardHeader><CardTitle>{testStats.skipped}</CardTitle><CardDescription>Skipped</CardDescription></CardHeader></Card>
        <Card><CardHeader><CardTitle>{testStats.coverage}%</CardTitle><CardDescription>Coverage</CardDescription></CardHeader></Card>
      </div>

      <Tabs defaultValue="suites">
        <TabsList>
          <TabsTrigger value="suites">Test Suites</TabsTrigger>
          <TabsTrigger value="coverage">Coverage</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="suites">
          <Card><CardContent className="pt-6"><p className="text-muted-foreground">74 test suites passing</p></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
