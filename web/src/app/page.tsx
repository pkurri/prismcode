import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const stats = [
  { label: 'Code Quality Score', value: '94%', trend: '+2%', color: 'text-green-500' },
  { label: 'Tests Passing', value: '847/850', trend: '99.6%', color: 'text-blue-500' },
  { label: 'Carbon Saved', value: '12.4kg', trend: '-23%', color: 'text-emerald-500' },
  { label: 'Issues Fixed', value: '156', trend: 'This Week', color: 'text-purple-500' },
];

const recentActivity = [
  { action: 'Bug fix applied', file: 'auth/login.ts', time: '2 min ago', type: 'fix' },
  { action: 'Tests generated', file: 'api/users.ts', time: '15 min ago', type: 'test' },
  { action: 'Accessibility scan', file: 'components/', time: '1 hour ago', type: 'a11y' },
  { action: 'Tech debt reduced', file: 'utils/helpers.ts', time: '3 hours ago', type: 'debt' },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here&apos;s your code intelligence overview.
          </p>
        </div>
        <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-purple-500/20">
          Run Full Analysis
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/50"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-500">{stat.trend}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions from PrismCode AI engine</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <Badge
                        variant={
                          item.type === 'fix'
                            ? 'default'
                            : item.type === 'test'
                              ? 'secondary'
                              : item.type === 'a11y'
                                ? 'outline'
                                : 'default'
                        }
                        className="w-16 justify-center"
                      >
                        {item.type}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.action}</p>
                      <p className="text-sm text-muted-foreground truncate">{item.file}</p>
                    </div>
                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                      {item.time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
              <CardDescription>Intelligent analysis of your codebase</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
                  <h4 className="font-semibold text-blue-400">Performance Opportunity</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    3 components could benefit from memoization, reducing re-renders by ~40%.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
                  <h4 className="font-semibold text-amber-400">Security Alert</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    1 dependency has a known vulnerability. Update axios to 1.6.0+.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Smart Suggestions</CardTitle>
              <CardDescription>AI-powered recommendations for your code</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <span className="text-2xl">🎯</span>
                  <div className="flex-1">
                    <p className="font-medium">Add error boundaries to 5 components</p>
                    <p className="text-sm text-muted-foreground">Improve app resilience</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Apply
                  </Button>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <span className="text-2xl">♿</span>
                  <div className="flex-1">
                    <p className="font-medium">Fix 12 accessibility issues</p>
                    <p className="text-sm text-muted-foreground">Missing alt texts and labels</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Apply
                  </Button>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <span className="text-2xl">🌱</span>
                  <div className="flex-1">
                    <p className="font-medium">Optimize 3 CI pipelines</p>
                    <p className="text-sm text-muted-foreground">Reduce carbon by 2.1kg/week</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Apply
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
