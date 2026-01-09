import { NextResponse } from 'next/server';

// Mock data - connects to achievements, leaderboards backend modules
const achievementsData = {
  user: {
    id: 'user_1',
    name: 'Prasad K',
    level: 21,
    xp: 10800,
    xpToNext: 1200,
    streak: 8,
    rank: 3,
  },
  badges: [
    { id: 1, name: 'First Commit', earned: true, date: '2024-01-15' },
    { id: 2, name: 'Bug Squasher', earned: true, date: '2024-02-20' },
    { id: 3, name: 'Clean Streak', earned: true, date: '2024-03-10' },
    { id: 4, name: 'Code Guardian', earned: true, date: '2024-04-05' },
    { id: 5, name: 'Speed Demon', earned: false, progress: 7, target: 10 },
    { id: 6, name: 'AI Whisperer', earned: false, progress: 67, target: 100 },
  ],
  leaderboard: [
    { rank: 1, name: 'Alice Chen', xp: 12450, level: 24 },
    { rank: 2, name: 'Bob Smith', xp: 11200, level: 22 },
    { rank: 3, name: 'Prasad K', xp: 10800, level: 21 },
  ],
  challenges: [
    { id: 1, name: 'Bug Squash Week', progress: 12, target: 20, ends: '3 days' },
    { id: 2, name: 'Coverage Sprint', progress: 2, target: 5, ends: '5 days' },
  ],
};

export async function GET() {
  return NextResponse.json({
    success: true,
    data: achievementsData,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action, challengeId } = body;

  switch (action) {
    case 'joinChallenge':
      return NextResponse.json({
        success: true,
        message: `Joined challenge ${challengeId}`,
      });
    case 'claimReward':
      return NextResponse.json({
        success: true,
        message: 'Reward claimed!',
        xpGranted: 500,
      });
    default:
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  }
}
