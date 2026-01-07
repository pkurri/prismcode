/**
 * Achievement & Badge System Tests
 * Issue #252
 */

import { AchievementSystem } from '../../../src/advanced/achievements';

describe('AchievementSystem', () => {
  let system: AchievementSystem;

  beforeEach(() => {
    system = new AchievementSystem();
  });

  describe('user initialization', () => {
    it('should initialize new user', () => {
      system.initUser('user-1', 'testuser');
      const progress = system.getUserProgress('user-1');

      expect(progress).toBeDefined();
      expect(progress?.totalPoints).toBe(0);
      expect(progress?.level).toBe(1);
    });
  });

  describe('achievement checking', () => {
    it('should unlock achievement when criteria met', () => {
      system.initUser('user-1');

      const unlocked = system.checkAchievements('user-1', {
        bugs_fixed: 1,
      });

      expect(unlocked.length).toBe(1);
      expect(unlocked[0].name).toBe('Bug Squasher');
    });

    it('should not unlock same achievement twice', () => {
      system.initUser('user-1');

      system.checkAchievements('user-1', { bugs_fixed: 1 });
      const secondCheck = system.checkAchievements('user-1', { bugs_fixed: 2 });

      expect(secondCheck.find((a) => a.name === 'Bug Squasher')).toBeUndefined();
    });

    it('should award points for achievements', () => {
      system.initUser('user-1');

      system.checkAchievements('user-1', { bugs_fixed: 1 });
      const progress = system.getUserProgress('user-1');

      expect(progress?.totalPoints).toBe(10); // Bug Squasher = 10 points
    });
  });

  describe('streak tracking', () => {
    it('should track streaks on success', () => {
      system.initUser('user-1');

      system.trackStreak('user-1', 'clean_builds', true);
      system.trackStreak('user-1', 'clean_builds', true);

      const progress = system.getUserProgress('user-1');
      const streak = progress?.currentStreaks.find((s) => s.type === 'clean_builds');

      expect(streak?.count).toBe(2);
    });

    it('should reset streak on failure', () => {
      system.initUser('user-1');

      system.trackStreak('user-1', 'clean_builds', true);
      system.trackStreak('user-1', 'clean_builds', true);
      system.trackStreak('user-1', 'clean_builds', false);

      const progress = system.getUserProgress('user-1');
      const streak = progress?.currentStreaks.find((s) => s.type === 'clean_builds');

      expect(streak).toBeUndefined();
    });
  });

  describe('leaderboard', () => {
    it('should add user to leaderboard', () => {
      system.initUser('user-1', 'alice');
      system.initUser('user-2', 'bob');

      system.checkAchievements('user-1', { bugs_fixed: 5 });

      const leaderboard = system.getLeaderboard('weekly');

      expect(leaderboard.entries.length).toBe(2);
      expect(leaderboard.entries[0].username).toBe('alice');
    });

    it('should rank users by points', () => {
      system.initUser('user-1', 'alice');
      system.initUser('user-2', 'bob');

      // Bob earns Bug Squasher (10) + Master Fixer (500) = 510 points
      system.checkAchievements('user-2', { bugs_fixed: 100 });
      // Alice earns Bug Squasher (10) only = 10 points
      system.checkAchievements('user-1', { bugs_fixed: 1 });

      // Verify progress points directly
      const bobProgress = system.getUserProgress('user-2');
      const aliceProgress = system.getUserProgress('user-1');

      expect(bobProgress!.totalPoints).toBeGreaterThan(aliceProgress!.totalPoints);
      expect(bobProgress!.achievements.length).toBeGreaterThan(aliceProgress!.achievements.length);
    });
  });

  describe('achievement categories', () => {
    it('should filter by category', () => {
      const qualityAchievements = system.getAchievementsByCategory('quality');

      expect(qualityAchievements.length).toBeGreaterThan(0);
      expect(qualityAchievements.every((a) => a.category === 'quality')).toBe(true);
    });

    it('should have at least 20 achievements', () => {
      const all = system.getAvailableAchievements();
      expect(all.length).toBeGreaterThanOrEqual(20);
    });
  });

  describe('rarity tiers', () => {
    it('should have all rarity tiers', () => {
      const common = system.getAchievementsByRarity('common');
      const rare = system.getAchievementsByRarity('rare');
      const epic = system.getAchievementsByRarity('epic');
      const legendary = system.getAchievementsByRarity('legendary');

      expect(common.length).toBeGreaterThan(0);
      expect(rare.length).toBeGreaterThan(0);
      expect(epic.length).toBeGreaterThan(0);
      expect(legendary.length).toBeGreaterThan(0);
    });

    it('should return rarity points', () => {
      const points = system.getRarityPoints();

      expect(points.common).toBe(1);
      expect(points.legendary).toBe(10);
    });
  });

  describe('share cards', () => {
    it('should generate share card for earned achievement', () => {
      system.initUser('user-1');
      system.checkAchievements('user-1', { bugs_fixed: 1 });

      const card = system.generateShareCard('user-1', 'first-fix');

      expect(card).toBeDefined();
      expect(card?.shareText).toContain('Bug Squasher');
    });

    it('should return null for unearned achievement', () => {
      system.initUser('user-1');

      const card = system.generateShareCard('user-1', 'refactor-king');
      expect(card).toBeNull();
    });
  });

  describe('level calculation', () => {
    it('should calculate level from points', () => {
      system.initUser('user-1');

      // Unlock multiple achievements
      system.checkAchievements('user-1', {
        bugs_fixed: 100,
        tests_written: 1,
        reviews_completed: 1,
      });

      const progress = system.getUserProgress('user-1');
      expect(progress?.level).toBeGreaterThan(1);
    });
  });
});
