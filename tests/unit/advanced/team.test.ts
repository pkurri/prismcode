/**
 * Team Collaboration Tests
 * Tests for Issues #120, #121: Team Collaboration & Audit Logging
 */

import { TeamService, AuditLogger } from '../../../src/advanced/team';

describe('TeamService', () => {
  let service: TeamService;

  beforeEach(() => {
    service = new TeamService();
  });

  describe('createTeam', () => {
    it('should create a team with owner', async () => {
      const team = await service.createTeam('My Team', 'user1', 'John Doe');

      expect(team.id).toBeDefined();
      expect(team.name).toBe('My Team');
      expect(team.members.length).toBe(1);
      expect(team.members[0].role).toBe('owner');
    });
  });

  describe('addMember', () => {
    it('should add member to team', async () => {
      const team = await service.createTeam('Team', 'owner1', 'Owner');

      const result = await service.addMember(team.id, {
        id: 'user2',
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'member',
      });

      expect(result).toBe(true);
      const updated = await service.getTeam(team.id);
      expect(updated!.members.length).toBe(2);
    });

    it('should return false for non-existent team', async () => {
      const result = await service.addMember('non-existent', {
        id: 'user',
        name: 'User',
        email: 'user@example.com',
        role: 'member',
      });

      expect(result).toBe(false);
    });
  });

  describe('removeMember', () => {
    it('should remove member from team', async () => {
      const team = await service.createTeam('Team', 'owner1', 'Owner');
      await service.addMember(team.id, { id: 'user2', name: 'User', email: '', role: 'member' });

      const result = await service.removeMember(team.id, 'user2');

      expect(result).toBe(true);
      const updated = await service.getTeam(team.id);
      expect(updated!.members.length).toBe(1);
    });
  });

  describe('listTeams', () => {
    it('should list all teams', async () => {
      await service.createTeam('Team 1', 'o1', 'Owner 1');
      await service.createTeam('Team 2', 'o2', 'Owner 2');

      const teams = await service.listTeams();
      expect(teams.length).toBe(2);
    });
  });
});

describe('AuditLogger', () => {
  let logger: AuditLogger;

  beforeEach(() => {
    logger = new AuditLogger();
  });

  describe('log', () => {
    it('should log audit entry', () => {
      logger.log({
        userId: 'user1',
        userName: 'John Doe',
        action: 'CREATE',
        resource: 'team',
        resourceId: 'team_1',
      });

      const logs = logger.query({});
      expect(logs.length).toBe(1);
      expect(logs[0].action).toBe('CREATE');
    });
  });

  describe('query', () => {
    beforeEach(() => {
      logger.log({
        userId: 'user1',
        userName: 'John',
        action: 'CREATE',
        resource: 'team',
        resourceId: '1',
      });
      logger.log({
        userId: 'user2',
        userName: 'Jane',
        action: 'UPDATE',
        resource: 'team',
        resourceId: '1',
      });
      logger.log({
        userId: 'user1',
        userName: 'John',
        action: 'DELETE',
        resource: 'agent',
        resourceId: '2',
      });
    });

    it('should filter by userId', () => {
      const logs = logger.query({ userId: 'user1' });
      expect(logs.length).toBe(2);
    });

    it('should filter by action', () => {
      const logs = logger.query({ action: 'CREATE' });
      expect(logs.length).toBe(1);
    });

    it('should filter by resource', () => {
      const logs = logger.query({ resource: 'team' });
      expect(logs.length).toBe(2);
    });

    it('should limit results', () => {
      const logs = logger.query({ limit: 1 });
      expect(logs.length).toBe(1);
    });
  });
});
