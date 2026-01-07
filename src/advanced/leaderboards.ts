/**
 * Team Leaderboards & Weekly Challenges
 * Issue #253: Team Leaderboards & Weekly Challenges
 *
 * Gamification features for team engagement and friendly competition
 */

import logger from '../utils/logger';

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  score: number;
  rank: number;
  achievements: string[];
  streak: number;
  lastActive: Date;
}

export interface Leaderboard {
  id: string;
  name: string;
  type: 'weekly' | 'monthly' | 'all-time';
  category: LeaderboardCategory;
  entries: LeaderboardEntry[];
  updatedAt: Date;
}

export type LeaderboardCategory =
  | 'code-reviews'
  | 'bugs-fixed'
  | 'tests-written'
  | 'documentation'
  | 'refactoring'
  | 'overall';

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'individual' | 'team';
  goal: number;
  metric: string;
  startDate: Date;
  endDate: Date;
  participants: ChallengeParticipant[];
  reward: string;
  isActive: boolean;
}

export interface ChallengeParticipant {
  userId: string;
  userName: string;
  progress: number;
  completed: boolean;
  completedAt?: Date;
}

export interface WeeklyStats {
  userId: string;
  week: string;
  codeReviews: number;
  bugsFixed: number;
  testsWritten: number;
  linesDocumented: number;
  refactorings: number;
}

/**
 * Leaderboard Manager
 * Manages team leaderboards and weekly challenges
 */
export class LeaderboardManager {
  private leaderboards: Map<string, Leaderboard> = new Map();
  private challenges: Map<string, Challenge> = new Map();
  private weeklyStats: Map<string, WeeklyStats[]> = new Map();

  constructor() {
    this.initializeDefaultLeaderboards();
    logger.info('LeaderboardManager initialized');
  }

  private initializeDefaultLeaderboards(): void {
    const categories: LeaderboardCategory[] = [
      'code-reviews',
      'bugs-fixed',
      'tests-written',
      'documentation',
      'overall',
    ];

    for (const category of categories) {
      const id = `lb_weekly_${category}`;
      this.leaderboards.set(id, {
        id,
        name: `Weekly ${this.formatCategory(category)}`,
        type: 'weekly',
        category,
        entries: [],
        updatedAt: new Date(),
      });
    }
  }

  /**
   * Record activity for a user
   */
  recordActivity(
    userId: string,
    userName: string,
    category: LeaderboardCategory,
    points: number
  ): void {
    const weekKey = this.getWeekKey();

    // Update weekly stats
    let userStats = this.weeklyStats.get(userId);
    if (!userStats) {
      userStats = [];
      this.weeklyStats.set(userId, userStats);
    }

    let currentWeek = userStats.find((s) => s.week === weekKey);
    if (!currentWeek) {
      currentWeek = {
        userId,
        week: weekKey,
        codeReviews: 0,
        bugsFixed: 0,
        testsWritten: 0,
        linesDocumented: 0,
        refactorings: 0,
      };
      userStats.push(currentWeek);
    }

    // Update category-specific stat
    switch (category) {
      case 'code-reviews':
        currentWeek.codeReviews += points;
        break;
      case 'bugs-fixed':
        currentWeek.bugsFixed += points;
        break;
      case 'tests-written':
        currentWeek.testsWritten += points;
        break;
      case 'documentation':
        currentWeek.linesDocumented += points;
        break;
      case 'refactoring':
        currentWeek.refactorings += points;
        break;
    }

    // Update leaderboard
    this.updateLeaderboard(`lb_weekly_${category}`, userId, userName, points);
    this.updateLeaderboard('lb_weekly_overall', userId, userName, points);

    // Check challenges
    this.updateChallengeProgress(userId, userName, category, points);

    logger.debug('Activity recorded', { userId, category, points });
  }

  /**
   * Create a new challenge
   */
  createChallenge(
    name: string,
    description: string,
    type: 'individual' | 'team',
    goal: number,
    metric: string,
    durationDays: number,
    reward: string
  ): Challenge {
    const challenge: Challenge = {
      id: `challenge_${Date.now().toString(16)}`,
      name,
      description,
      type,
      goal,
      metric,
      startDate: new Date(),
      endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
      participants: [],
      reward,
      isActive: true,
    };

    this.challenges.set(challenge.id, challenge);
    logger.info('Challenge created', { id: challenge.id, name });
    return challenge;
  }

  /**
   * Join a challenge
   */
  joinChallenge(challengeId: string, userId: string, userName: string): boolean {
    const challenge = this.challenges.get(challengeId);
    if (!challenge || !challenge.isActive) return false;

    if (challenge.participants.some((p) => p.userId === userId)) return false;

    challenge.participants.push({
      userId,
      userName,
      progress: 0,
      completed: false,
    });

    logger.info('User joined challenge', { challengeId, userId });
    return true;
  }

  /**
   * Get leaderboard
   */
  getLeaderboard(
    category: LeaderboardCategory,
    type: 'weekly' | 'monthly' | 'all-time' = 'weekly'
  ): Leaderboard | null {
    const id = `lb_${type}_${category}`;
    return this.leaderboards.get(id) || null;
  }

  /**
   * Get active challenges
   */
  getActiveChallenges(): Challenge[] {
    const now = new Date();
    return Array.from(this.challenges.values()).filter((c) => c.isActive && c.endDate > now);
  }

  /**
   * Get user rank
   */
  getUserRank(userId: string, category: LeaderboardCategory = 'overall'): number | null {
    const leaderboard = this.getLeaderboard(category);
    if (!leaderboard) return null;

    const entry = leaderboard.entries.find((e) => e.userId === userId);
    return entry?.rank || null;
  }

  /**
   * Get top performers
   */
  getTopPerformers(category: LeaderboardCategory, limit: number = 10): LeaderboardEntry[] {
    const leaderboard = this.getLeaderboard(category);
    if (!leaderboard) return [];

    return leaderboard.entries.slice(0, limit);
  }

  private updateLeaderboard(
    leaderboardId: string,
    userId: string,
    userName: string,
    points: number
  ): void {
    let leaderboard = this.leaderboards.get(leaderboardId);
    if (!leaderboard) {
      leaderboard = {
        id: leaderboardId,
        name: leaderboardId,
        type: 'weekly',
        category: 'overall',
        entries: [],
        updatedAt: new Date(),
      };
      this.leaderboards.set(leaderboardId, leaderboard);
    }

    let entry = leaderboard.entries.find((e) => e.userId === userId);
    if (!entry) {
      entry = {
        userId,
        userName,
        score: 0,
        rank: leaderboard.entries.length + 1,
        achievements: [],
        streak: 1,
        lastActive: new Date(),
      };
      leaderboard.entries.push(entry);
    }

    entry.score += points;
    entry.lastActive = new Date();

    // Re-rank
    leaderboard.entries.sort((a, b) => b.score - a.score);
    leaderboard.entries.forEach((e, i) => (e.rank = i + 1));
    leaderboard.updatedAt = new Date();
  }

  private updateChallengeProgress(
    userId: string,
    userName: string,
    category: LeaderboardCategory,
    points: number
  ): void {
    for (const challenge of this.challenges.values()) {
      if (!challenge.isActive || challenge.endDate < new Date()) continue;

      const participant = challenge.participants.find((p) => p.userId === userId);
      if (!participant) continue;

      if (challenge.metric === category || challenge.metric === 'any') {
        participant.progress += points;
        if (participant.progress >= challenge.goal && !participant.completed) {
          participant.completed = true;
          participant.completedAt = new Date();
          logger.info('Challenge completed', { challengeId: challenge.id, userId });
        }
      }
    }
  }

  private getWeekKey(): string {
    const now = new Date();
    const year = now.getFullYear();
    const week = Math.ceil(
      (now.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }

  private formatCategory(category: string): string {
    return category
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
}

export const leaderboardManager = new LeaderboardManager();
