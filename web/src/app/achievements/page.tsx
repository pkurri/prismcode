'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const achievements = [
  {
    id: 1,
    name: 'First Commit',
    desc: 'Push your first code',
    icon: '🎯',
    rarity: 'common',
    earned: true,
    date: '2024-01-15',
  },
  {
    id: 2,
    name: 'Bug Squasher',
    desc: 'Fix 10 bugs',
    icon: '🐛',
    rarity: 'common',
    earned: true,
    date: '2024-02-20',
  },
  {
    id: 3,
    name: 'Clean Streak',
    desc: '7 days of passing builds',
    icon: '✨',
    rarity: 'rare',
    earned: true,
    date: '2024-03-10',
  },
  {
    id: 4,
    name: 'Code Guardian',
    desc: '100% test coverage on a module',
    icon: '🛡️',
    rarity: 'rare',
    earned: true,
    date: '2024-04-05',
  },
  {
    id: 5,
    name: 'Speed Demon',
    desc: 'Review 10 PRs in one day',
    icon: '⚡',
    rarity: 'epic',
    earned: false,
    progress: 7,
    target: 10,
  },
  {
    id: 6,
    name: 'AI Whisperer',
    desc: 'Use AI assistant 100 times',
    icon: '🤖',
    rarity: 'epic',
    earned: false,
    progress: 67,
    target: 100,
  },
  {
    id: 7,
    name: 'Zero Debt',
    desc: 'Eliminate all tech debt',
    icon: '💎',
    rarity: 'legendary',
    earned: false,
    progress: 0,
    target: 1,
  },
  {
    id: 8,
    name: 'Green Champion',
    desc: 'Reduce carbon footprint by 50%',
    icon: '🌱',
    rarity: 'legendary',
    earned: false,
    progress: 28,
    target: 50,
  },
];

const leaderboard = [
  { rank: 1, name: 'Alice Chen', avatar: 'AC', xp: 12450, level: 24, streak: 15 },
  { rank: 2, name: 'Bob Smith', avatar: 'BS', xp: 11200, level: 22, streak: 12 },
  { rank: 3, name: 'Prasad K', avatar: 'PK', xp: 10800, level: 21, streak: 8 },
  { rank: 4, name: 'Diana Lee', avatar: 'DL', xp: 9500, level: 19, streak: 5 },
  { rank: 5, name: 'Eve Wang', avatar: 'EW', xp: 8200, level: 17, streak: 3 },
];

const challenges = [
  {
    id: 1,
    name: 'Bug Squash Week',
    desc: 'Close 20 bugs this week',
    reward: '500 XP',
    ends: '3 days',
    progress: 12,
    target: 20,
  },
  {
    id: 2,
    name: 'Coverage Sprint',
    desc: 'Increase coverage by 5%',
    reward: '750 XP + Badge',
    ends: '5 days',
    progress: 2,
    target: 5,
  },
  {
    id: 3,
    name: 'Green Code Challenge',
    desc: 'Improve energy efficiency',
    reward: '1000 XP',
    ends: '7 days',
    progress: 0,
    target: 10,
  },
];

const rarityColors: Record<string, string> = {
  common: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  rare: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  epic: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  legendary: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
};

export default function AchievementsPage() {
  const [activeTab, setActiveTab] = useState('badges');
  const earnedCount = achievements.filter((a) => a.earned).length;
  const userXP = 10800;
  const userLevel = 21;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Achievements
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your progress and compete with your team
          </p>
        </div>
        <Card className="px-4 py-2">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
              L{userLevel}
            </div>
            <div>
              <p className="font-medium">{userXP.toLocaleString()} XP</p>
              <div className="w-24 h-2 bg-muted rounded-full mt-1">
                <div className="h-full bg-violet-500 rounded-full" style={{ width: '68%' }} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="badges">
            Badges ({earnedCount}/{achievements.length})
          </TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((a) => (
            <Card
              key={a.id}
              className={`transition-all ${a.earned ? 'hover:shadow-md' : 'opacity-60'}`}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <span className={`text-4xl ${!a.earned && 'grayscale'}`}>{a.icon}</span>
                  <h3 className="font-semibold mt-3">{a.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{a.desc}</p>
                  <Badge variant="outline" className={`mt-3 text-xs ${rarityColors[a.rarity]}`}>
                    {a.rarity}
                  </Badge>
                  {a.earned ? (
                    <p className="text-xs text-muted-foreground mt-2">Earned {a.date}</p>
                  ) : (
                    <div className="mt-3">
                      <div className="w-full h-2 bg-muted rounded-full">
                        <div
                          className="h-full bg-violet-500 rounded-full"
                          style={{ width: `${((a.progress || 0) / (a.target || 1)) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {a.progress}/{a.target}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team Leaderboard</CardTitle>
            <CardDescription>This week&apos;s top contributors</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 w-16">#</th>
                  <th className="text-left p-4">Developer</th>
                  <th className="text-left p-4">Level</th>
                  <th className="text-left p-4">XP</th>
                  <th className="text-left p-4">Streak</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((u) => (
                  <tr
                    key={u.rank}
                    className={`border-b ${u.name === 'Prasad K' ? 'bg-primary/5' : ''}`}
                  >
                    <td className="p-4 font-bold">
                      {u.rank <= 3 ? ['🥇', '🥈', '🥉'][u.rank - 1] : u.rank}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                          {u.avatar}
                        </div>
                        <span className="font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary">Lvl {u.level}</Badge>
                    </td>
                    <td className="p-4">{u.xp.toLocaleString()}</td>
                    <td className="p-4">
                      <span className="text-orange-500">🔥 {u.streak} days</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'challenges' && (
        <div className="grid gap-4">
          {challenges.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{c.name}</h3>
                    <Badge variant="secondary">{c.reward}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{c.desc}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex-1 max-w-xs">
                      <div className="h-2 bg-muted rounded-full">
                        <div
                          className="h-full bg-violet-500 rounded-full"
                          style={{ width: `${(c.progress / c.target) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm">
                      {c.progress}/{c.target}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Ends in {c.ends}</p>
                  <Button size="sm" className="mt-2">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
