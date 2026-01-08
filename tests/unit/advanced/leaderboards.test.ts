import { LeaderboardManager } from '../../../src/advanced/leaderboards';

describe('LeaderboardManager', () => {
  let manager: LeaderboardManager;

  beforeEach(() => {
    manager = new LeaderboardManager();
  });

  describe('recordActivity', () => {
    it('should record activity and update leaderboard', () => {
      manager.recordActivity('user1', 'Alice', 'code-reviews', 5);
      manager.recordActivity('user2', 'Bob', 'code-reviews', 3);

      const leaderboard = manager.getLeaderboard('code-reviews');

      expect(leaderboard?.entries.length).toBe(2);
      expect(leaderboard?.entries[0].userName).toBe('Alice');
      expect(leaderboard?.entries[0].rank).toBe(1);
    });
  });

  describe('createChallenge', () => {
    it('should create a new challenge', () => {
      const challenge = manager.createChallenge(
        'Bug Bash Week',
        'Fix as many bugs as possible',
        'individual',
        10,
        'bugs-fixed',
        7,
        '50 bonus points'
      );

      expect(challenge.id).toBeDefined();
      expect(challenge.isActive).toBe(true);
    });
  });

  describe('joinChallenge', () => {
    it('should allow users to join challenges', () => {
      const challenge = manager.createChallenge(
        'Test Challenge',
        'Description',
        'individual',
        5,
        'tests-written',
        7,
        'Badge'
      );

      const joined = manager.joinChallenge(challenge.id, 'user1', 'Alice');

      expect(joined).toBe(true);
      expect(challenge.participants.length).toBe(1);
    });

    it('should prevent duplicate joins', () => {
      const challenge = manager.createChallenge('Test', 'Desc', 'individual', 5, 'any', 7, 'Badge');

      manager.joinChallenge(challenge.id, 'user1', 'Alice');
      const secondJoin = manager.joinChallenge(challenge.id, 'user1', 'Alice');

      expect(secondJoin).toBe(false);
    });
  });

  describe('getActiveChallenges', () => {
    it('should return only active challenges', () => {
      manager.createChallenge('Active Challenge', 'Desc', 'team', 10, 'any', 7, 'Prize');

      const active = manager.getActiveChallenges();

      expect(active.length).toBeGreaterThan(0);
    });
  });

  describe('getUserRank', () => {
    it('should return user rank', () => {
      manager.recordActivity('user1', 'Alice', 'bugs-fixed', 10);
      manager.recordActivity('user2', 'Bob', 'bugs-fixed', 5);

      const aliceRank = manager.getUserRank('user1', 'bugs-fixed');
      const bobRank = manager.getUserRank('user2', 'bugs-fixed');

      expect(aliceRank).toBe(1);
      expect(bobRank).toBe(2);
    });
  });

  describe('getTopPerformers', () => {
    it('should return top performers', () => {
      manager.recordActivity('user1', 'Alice', 'tests-written', 15);
      manager.recordActivity('user2', 'Bob', 'tests-written', 10);
      manager.recordActivity('user3', 'Charlie', 'tests-written', 20);

      const top = manager.getTopPerformers('tests-written', 2);

      expect(top.length).toBe(2);
      expect(top[0].userName).toBe('Charlie');
    });
  });
});
