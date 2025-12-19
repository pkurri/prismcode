/**
 * Team Collaboration Features
 * Issues #120, #121: Team Collaboration & Audit Logging
 */

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  avatar?: string;
  lastActive?: Date;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: TeamMember[];
  createdAt: Date;
  settings: TeamSettings;
}

export interface TeamSettings {
  allowGuestAccess: boolean;
  requireApproval: boolean;
  defaultRole: TeamMember['role'];
  notifyOnActivity: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Team Management Service (#120)
 */
export class TeamService {
  private teams: Map<string, Team> = new Map();

  createTeam(name: string, ownerId: string, ownerName: string): Promise<Team> {
    const team: Team = {
      id: this.generateId(),
      name,
      members: [
        {
          id: ownerId,
          name: ownerName,
          email: '',
          role: 'owner',
        },
      ],
      createdAt: new Date(),
      settings: {
        allowGuestAccess: false,
        requireApproval: true,
        defaultRole: 'member',
        notifyOnActivity: true,
      },
    };

    this.teams.set(team.id, team);
    return Promise.resolve(team);
  }

  addMember(teamId: string, member: Omit<TeamMember, 'lastActive'>): Promise<boolean> {
    const team = this.teams.get(teamId);
    if (!team) return Promise.resolve(false);

    team.members.push({ ...member, lastActive: new Date() });
    return Promise.resolve(true);
  }

  removeMember(teamId: string, memberId: string): Promise<boolean> {
    const team = this.teams.get(teamId);
    if (!team) return Promise.resolve(false);

    team.members = team.members.filter((m) => m.id !== memberId);
    return Promise.resolve(true);
  }

  getTeam(teamId: string): Promise<Team | null> {
    return Promise.resolve(this.teams.get(teamId) || null);
  }

  listTeams(): Promise<Team[]> {
    return Promise.resolve(Array.from(this.teams.values()));
  }

  private generateId(): string {
    return `team_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
}

/**
 * Audit Logging Service (#121)
 */
export class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private maxLogs: number = 10000;

  log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
    const fullEntry: AuditLogEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date(),
    };

    this.logs.push(fullEntry);

    // Keep only last N logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  query(options: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): AuditLogEntry[] {
    return this.logs
      .filter((log) => {
        if (options.userId && log.userId !== options.userId) return false;
        if (options.action && log.action !== options.action) return false;
        if (options.resource && log.resource !== options.resource) return false;
        if (options.startDate && log.timestamp < options.startDate) return false;
        if (options.endDate && log.timestamp > options.endDate) return false;
        return true;
      })
      .slice(0, options.limit || 100);
  }

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
}
