'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  score: number;
  change: number;
  achievements: number;
  streak: number;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'individual' | 'team';
  category: 'bugs' | 'coverage' | 'reviews' | 'speed';
  startDate: string;
  endDate: string;
  participants: number;
  prize: string;
  progress?: number;
  goal?: number;
}

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, userId: '1', name: 'Sarah Chen', score: 2450, change: 2, achievements: 18, streak: 15 },
  { rank: 2, userId: '2', name: 'Alex Thompson', score: 2280, change: -1, achievements: 15, streak: 8 },
  { rank: 3, userId: '3', name: 'Jordan Rivera', score: 2150, change: 1, achievements: 14, streak: 12 },
  { rank: 4, userId: '4', name: 'Taylor Kim', score: 1980, change: 0, achievements: 12, streak: 5 },
  { rank: 5, userId: '5', name: 'Morgan Lee', score: 1820, change: 3, achievements: 11, streak: 7 },
  { rank: 6, userId: '6', name: 'Casey Davis', score: 1650, change: -2, achievements: 10, streak: 3 },
  { rank: 7, userId: '7', name: 'You', score: 1540, change: 1, achievements: 9, streak: 12 },
];

const mockChallenges: Challenge[] = [
  { id: '1', name: 'Bug Squash Week', description: 'Fix the most bugs this week', type: 'individual', category: 'bugs', startDate: 'Jan 8', endDate: 'Jan 15', participants: 12, prize: '🏆 Bug Hunter Badge', progress: 8, goal: 15 },
  { id: '2', name: 'Coverage Sprint', description: 'Increase test coverage by 10%', type: 'team', category: 'coverage', startDate: 'Jan 10', endDate: 'Jan 24', participants: 4, prize: '⭐ Coverage Champion', progress: 4, goal: 10 },
  { id: '3', name: 'Review Marathon', description: 'Complete 50 team reviews', type: 'team', category: 'reviews', startDate: 'Jan 15', endDate: 'Jan 22', participants: 6, prize: '🔍 Eagle Eye Badge' },
  { id: '4', name: 'Speed Demon', description: 'Fastest PR merge time', type: 'individual', category: 'speed', startDate: 'Jan 20', endDate: 'Jan 27', participants: 8, prize: '⚡ Lightning Badge' },
];

const challengeTemplates = [
  { id: 't1', name: 'Bug Squash Week', icon: '🐛', description: 'Team competes to fix bugs' },
  { id: 't2', name: 'Coverage Sprint', icon: '📊', description: 'Improve test coverage together' },
  { id: 't3', name: 'Review Week', icon: '🔍', description: 'Complete quality reviews' },
  { id: 't4', name: 'Documentation Day', icon: '📝', description: 'Write and update docs' },
];

export default function LeaderboardsPage() {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');
  const currentUserRank = mockLeaderboard.find(e => e.name === 'You')?.rank || 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Leaderboards & Challenges
          </h1>
          <p className="text-muted-foreground">Compete with your team and earn rewards</p>
        </div>
        <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          + Create Challenge
        </Button>
      </div>

      <Tabs defaultValue="leaderboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Rankings</CardTitle>
                  <CardDescription>Your rank: #{currentUserRank}</CardDescription>
                </div>
                <div className="flex gap-1">
                  {(['week', 'month', 'all'] as const).map(t => (
                    <Button
                      key={t}
                      variant={timeframe === t ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setTimeframe(t)}
                      className="capitalize"
                    >
                      {t === 'all' ? 'All Time' : `This ${t}`}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {mockLeaderboard.map((entry, i) => (
                <div 
                  key={entry.userId} 
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    entry.name === 'You' ? 'bg-primary/10 border border-primary/30' : 'bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      entry.rank === 1 ? 'bg-amber-500 text-white' :
                      entry.rank === 2 ? 'bg-gray-400 text-white' :
                      entry.rank === 3 ? 'bg-amber-700 text-white' : 'bg-muted'
                    }`}>
                      {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-medium">
                      {entry.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium">{entry.name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>🏆 {entry.achievements}</span>
                        <span>🔥 {entry.streak}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm ${entry.change > 0 ? 'text-green-500' : entry.change < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                      {entry.change > 0 ? `↑${entry.change}` : entry.change < 0 ? `↓${Math.abs(entry.change)}` : '–'}
                    </span>
                    <span className="font-bold text-lg">{entry.score.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges">
          <div className="grid gap-4 md:grid-cols-2">
            {mockChallenges.map(challenge => (
              <Card key={challenge.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={challenge.type === 'team' ? 'default' : 'secondary'}>
                      {challenge.type}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{challenge.startDate} - {challenge.endDate}</span>
                  </div>
                  <CardTitle className="text-lg mt-2">{challenge.name}</CardTitle>
                  <CardDescription>{challenge.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {challenge.progress !== undefined && challenge.goal && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>{challenge.progress}/{challenge.goal}</span>
                        <span>{Math.round((challenge.progress / challenge.goal) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-violet-500 to-purple-500" 
                          style={{ width: `${(challenge.progress / challenge.goal) * 100}%` }} 
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{challenge.participants} participants</span>
                    <span className="text-sm">{challenge.prize}</span>
                  </div>
                  <Button className="w-full mt-3" variant="outline">Join Challenge</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Challenge Templates</CardTitle>
              <CardDescription>Quick-start challenges for your team</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {challengeTemplates.map(template => (
                <button
                  key={template.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 text-left transition-colors"
                >
                  <span className="text-3xl">{template.icon}</span>
                  <div>
                    <p className="font-medium">{template.name}</p>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
