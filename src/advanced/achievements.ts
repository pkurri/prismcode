/**
 * Achievement & Badge System
 * Issue #252 - Gamification for developer engagement
 */

export type AchievementCategory =
  | 'quality'
  | 'coverage'
  | 'review'
  | 'streak'
  | 'collaboration'
  | 'security';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: Rarity;
  icon: string;
  points: number;
  criteria: AchievementCriteria;
  unlockedAt?: Date;
}

export interface AchievementCriteria {
  type: 'count' | 'streak' | 'threshold' | 'special';
  metric: string;
  target: number;
  currentValue?: number;
}

export interface UserProgress {
  userId: string;
  totalPoints: number;
  achievements: Achievement[];
  currentStreaks: Streak[];
  level: number;
  rank: number;
}

export interface Streak {
  type: string;
  count: number;
  startDate: Date;
  lastUpdate: Date;
}

export interface Leaderboard {
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  entries: LeaderboardEntry[];
  updatedAt: Date;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  points: number;
  achievements: number;
  rank: number;
}

export interface ShareCard {
  userId: string;
  achievement: Achievement;
  generatedAt: Date;
  imageUrl: string;
  shareText: string;
}

// Predefined achievements (20+)
const ACHIEVEMENTS: Omit<Achievement, 'unlockedAt'>[] = [
  // Quality (6)
  {
    id: 'first-fix',
    name: 'Bug Squasher',
    description: 'Fix your first bug',
    category: 'quality',
    rarity: 'common',
    icon: '🐛',
    points: 10,
    criteria: { type: 'count', metric: 'bugs_fixed', target: 1 },
  },
  {
    id: 'master-fixer',
    name: 'Master Fixer',
    description: 'Fix 100 bugs',
    category: 'quality',
    rarity: 'epic',
    icon: '🔧',
    points: 500,
    criteria: { type: 'count', metric: 'bugs_fixed', target: 100 },
  },
  {
    id: 'zero-bugs',
    name: 'Zero Bugs',
    description: 'Release with no bugs',
    category: 'quality',
    rarity: 'rare',
    icon: '✨',
    points: 100,
    criteria: { type: 'special', metric: 'clean_release', target: 1 },
  },
  {
    id: 'clean-code',
    name: 'Clean Coder',
    description: 'Pass lint with no warnings',
    category: 'quality',
    rarity: 'common',
    icon: '🧹',
    points: 25,
    criteria: { type: 'count', metric: 'clean_lints', target: 1 },
  },
  {
    id: 'refactor-king',
    name: 'Refactor King',
    description: 'Reduce complexity by 50%',
    category: 'quality',
    rarity: 'legendary',
    icon: '👑',
    points: 1000,
    criteria: { type: 'threshold', metric: 'complexity_reduction', target: 50 },
  },
  {
    id: 'debt-destroyer',
    name: 'Debt Destroyer',
    description: 'Reduce tech debt score',
    category: 'quality',
    rarity: 'rare',
    icon: '💥',
    points: 150,
    criteria: { type: 'threshold', metric: 'debt_reduction', target: 20 },
  },

  // Coverage (4)
  {
    id: 'first-test',
    name: 'Test Writer',
    description: 'Write your first test',
    category: 'coverage',
    rarity: 'common',
    icon: '📝',
    points: 10,
    criteria: { type: 'count', metric: 'tests_written', target: 1 },
  },
  {
    id: 'coverage-80',
    name: 'Coverage Champion',
    description: 'Achieve 80% coverage',
    category: 'coverage',
    rarity: 'rare',
    icon: '🏆',
    points: 200,
    criteria: { type: 'threshold', metric: 'coverage_percent', target: 80 },
  },
  {
    id: 'coverage-100',
    name: 'Perfect Coverage',
    description: 'Achieve 100% coverage',
    category: 'coverage',
    rarity: 'legendary',
    icon: '💯',
    points: 500,
    criteria: { type: 'threshold', metric: 'coverage_percent', target: 100 },
  },
  {
    id: 'test-hero',
    name: 'Test Hero',
    description: 'Write 500 tests',
    category: 'coverage',
    rarity: 'epic',
    icon: '🦸',
    points: 400,
    criteria: { type: 'count', metric: 'tests_written', target: 500 },
  },

  // Review (4)
  {
    id: 'first-review',
    name: 'Reviewer',
    description: 'Complete first code review',
    category: 'review',
    rarity: 'common',
    icon: '👀',
    points: 15,
    criteria: { type: 'count', metric: 'reviews_completed', target: 1 },
  },
  {
    id: 'review-master',
    name: 'Review Master',
    description: 'Complete 100 reviews',
    category: 'review',
    rarity: 'epic',
    icon: '🔍',
    points: 300,
    criteria: { type: 'count', metric: 'reviews_completed', target: 100 },
  },
  {
    id: 'helpful-review',
    name: 'Helpful Reviewer',
    description: 'Get 10 helpful votes',
    category: 'review',
    rarity: 'rare',
    icon: '🙌',
    points: 100,
    criteria: { type: 'count', metric: 'helpful_votes', target: 10 },
  },
  {
    id: 'quick-review',
    name: 'Speed Reviewer',
    description: 'Review within 1 hour',
    category: 'review',
    rarity: 'rare',
    icon: '⚡',
    points: 75,
    criteria: { type: 'special', metric: 'quick_review', target: 1 },
  },

  // Streak (4)
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: '7 day clean build streak',
    category: 'streak',
    rarity: 'rare',
    icon: '🔥',
    points: 100,
    criteria: { type: 'streak', metric: 'clean_builds', target: 7 },
  },
  {
    id: 'streak-30',
    name: 'Month Master',
    description: '30 day clean build streak',
    category: 'streak',
    rarity: 'epic',
    icon: '🌟',
    points: 500,
    criteria: { type: 'streak', metric: 'clean_builds', target: 30 },
  },
  {
    id: 'streak-100',
    name: 'Centurion',
    description: '100 day streak',
    category: 'streak',
    rarity: 'legendary',
    icon: '💎',
    points: 1500,
    criteria: { type: 'streak', metric: 'clean_builds', target: 100 },
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: '5 AM commits for a week',
    category: 'streak',
    rarity: 'rare',
    icon: '🌅',
    points: 75,
    criteria: { type: 'streak', metric: 'early_commits', target: 7 },
  },

  // Collaboration (3)
  {
    id: 'team-player',
    name: 'Team Player',
    description: 'Collaborate on 10 PRs',
    category: 'collaboration',
    rarity: 'common',
    icon: '🤝',
    points: 50,
    criteria: { type: 'count', metric: 'collaborative_prs', target: 10 },
  },
  {
    id: 'mentor',
    name: 'Mentor',
    description: 'Help 5 new developers',
    category: 'collaboration',
    rarity: 'rare',
    icon: '🎓',
    points: 150,
    criteria: { type: 'count', metric: 'helped_newbies', target: 5 },
  },
  {
    id: 'pairing',
    name: 'Pair Programmer',
    description: '10 pair programming sessions',
    category: 'collaboration',
    rarity: 'rare',
    icon: '👥',
    points: 100,
    criteria: { type: 'count', metric: 'pair_sessions', target: 10 },
  },

  // Security (3)
  {
    id: 'security-first',
    name: 'Security First',
    description: 'Fix first vulnerability',
    category: 'security',
    rarity: 'common',
    icon: '🔒',
    points: 25,
    criteria: { type: 'count', metric: 'vulns_fixed', target: 1 },
  },
  {
    id: 'security-hero',
    name: 'Security Hero',
    description: 'Fix 50 vulnerabilities',
    category: 'security',
    rarity: 'epic',
    icon: '🛡️',
    points: 400,
    criteria: { type: 'count', metric: 'vulns_fixed', target: 50 },
  },
  {
    id: 'zero-vulns',
    name: 'Fortress',
    description: 'Zero vulnerabilities for 30 days',
    category: 'security',
    rarity: 'legendary',
    icon: '🏰',
    points: 750,
    criteria: { type: 'streak', metric: 'zero_vulns', target: 30 },
  },
];

export class AchievementSystem {
  private userProgress: Map<string, UserProgress> = new Map();
  private achievements: Map<string, Achievement> = new Map();
  private leaderboards: Map<string, Leaderboard> = new Map();

  constructor() {
    ACHIEVEMENTS.forEach((a) => this.achievements.set(a.id, a as Achievement));
  }

  initUser(userId: string, username: string = userId): void {
    if (!this.userProgress.has(userId)) {
      this.userProgress.set(userId, {
        userId,
        totalPoints: 0,
        achievements: [],
        currentStreaks: [],
        level: 1,
        rank: 0,
      });
    }
    this.updateLeaderboard(userId, username);
  }

  checkAchievements(userId: string, metrics: Record<string, number>): Achievement[] {
    const progress = this.userProgress.get(userId);
    if (!progress) return [];

    const newlyUnlocked: Achievement[] = [];
    const earnedIds = new Set(progress.achievements.map((a) => a.id));

    for (const achievement of this.achievements.values()) {
      if (earnedIds.has(achievement.id)) continue;
      if (this.meetsRequirement(achievement.criteria, metrics)) {
        const unlocked = { ...achievement, unlockedAt: new Date() };
        progress.achievements.push(unlocked);
        progress.totalPoints += achievement.points;
        newlyUnlocked.push(unlocked);
      }
    }

    progress.level = this.calculateLevel(progress.totalPoints);
    return newlyUnlocked;
  }

  trackStreak(userId: string, streakType: string, success: boolean): Streak | null {
    const progress = this.userProgress.get(userId);
    if (!progress) return null;

    let streak = progress.currentStreaks.find((s) => s.type === streakType);

    if (success) {
      if (!streak) {
        streak = { type: streakType, count: 1, startDate: new Date(), lastUpdate: new Date() };
        progress.currentStreaks.push(streak);
      } else {
        streak.count++;
        streak.lastUpdate = new Date();
      }
    } else if (streak) {
      progress.currentStreaks = progress.currentStreaks.filter((s) => s.type !== streakType);
      return null;
    }

    return streak || null;
  }

  getLeaderboard(period: 'daily' | 'weekly' | 'monthly' | 'all_time' = 'weekly'): Leaderboard {
    let leaderboard = this.leaderboards.get(period);
    if (!leaderboard) {
      leaderboard = { period, entries: [], updatedAt: new Date() };
      this.leaderboards.set(period, leaderboard);
    }
    return leaderboard;
  }

  getUserProgress(userId: string): UserProgress | undefined {
    return this.userProgress.get(userId);
  }

  getAvailableAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  getAchievementsByCategory(category: AchievementCategory): Achievement[] {
    return this.getAvailableAchievements().filter((a) => a.category === category);
  }

  getAchievementsByRarity(rarity: Rarity): Achievement[] {
    return this.getAvailableAchievements().filter((a) => a.rarity === rarity);
  }

  generateShareCard(userId: string, achievementId: string): ShareCard | null {
    const progress = this.userProgress.get(userId);
    const achievement = progress?.achievements.find((a) => a.id === achievementId);
    if (!achievement) return null;

    return {
      userId,
      achievement,
      generatedAt: new Date(),
      imageUrl: `/share/${userId}/${achievementId}.png`,
      shareText: `🎉 I just earned the "${achievement.name}" achievement on PrismCode! ${achievement.icon}`,
    };
  }

  getRarityPoints(): Record<Rarity, number> {
    return { common: 1, rare: 2, epic: 4, legendary: 10 };
  }

  private meetsRequirement(
    criteria: AchievementCriteria,
    metrics: Record<string, number>
  ): boolean {
    const value = metrics[criteria.metric] || 0;
    switch (criteria.type) {
      case 'count':
      case 'streak':
      case 'threshold':
        return value >= criteria.target;
      case 'special':
        return value >= criteria.target;
      default:
        return false;
    }
  }

  private calculateLevel(points: number): number {
    return Math.floor(Math.sqrt(points / 100)) + 1;
  }

  private updateLeaderboard(userId: string, username: string): void {
    const progress = this.userProgress.get(userId);
    if (!progress) return;

    const periods: ('daily' | 'weekly' | 'monthly' | 'all_time')[] = ['weekly', 'all_time'];
    for (const period of periods) {
      let lb = this.leaderboards.get(period);
      if (!lb) {
        lb = { period, entries: [], updatedAt: new Date() };
        this.leaderboards.set(period, lb);
      }

      const existing = lb.entries.find((e) => e.userId === userId);
      if (existing) {
        existing.points = progress.totalPoints;
        existing.achievements = progress.achievements.length;
      } else {
        lb.entries.push({
          userId,
          username,
          points: progress.totalPoints,
          achievements: progress.achievements.length,
          rank: 0,
        });
      }

      lb.entries.sort((a, b) => b.points - a.points);
      lb.entries.forEach((e, i) => (e.rank = i + 1));
      lb.updatedAt = new Date();
    }
  }
}

export const achievementSystem = new AchievementSystem();
