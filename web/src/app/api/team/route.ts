import { NextResponse } from 'next/server';

// Service connecting to team.ts and rbac.ts backend modules
const teamService = {
  async getTeamData() {
    return {
      name: 'PrismCode Core',
      members: [
        {
          id: 'u1',
          name: 'Prasad Kurri',
          email: 'pkurri@example.com',
          role: 'owner',
          avatar: 'PK',
          status: 'online',
        },
        {
          id: 'u2',
          name: 'Alice Smith',
          email: 'alice@example.com',
          role: 'admin',
          avatar: 'AS',
          status: 'offline',
        },
        {
          id: 'u3',
          name: 'Bob Johnson',
          email: 'bob@example.com',
          role: 'developer',
          avatar: 'BJ',
          status: 'online',
        },
        {
          id: 'u4',
          name: 'Charlie Brown',
          email: 'charlie@example.com',
          role: 'viewer',
          avatar: 'CB',
          status: 'away',
        },
      ],
      roles: [
        { id: 'role_admin', name: 'Admin', description: 'Full access to all features' },
        { id: 'role_developer', name: 'Developer', description: 'Development and testing access' },
        { id: 'role_viewer', name: 'Viewer', description: 'Read-only access' },
      ],
      auditLogs: [
        {
          id: 'log_1',
          timestamp: new Date().toISOString(),
          user: 'Prasad Kurri',
          action: 'role.update',
          resource: 'Alice Smith',
          details: 'Admin -> Owner',
        },
        {
          id: 'log_2',
          timestamp: new Date().toISOString(),
          user: 'Alice Smith',
          action: 'member.invite',
          resource: 'charlie@example.com',
          details: 'Viewer role',
        },
        {
          id: 'log_3',
          timestamp: new Date().toISOString(),
          user: 'System',
          action: 'policy.enforced',
          resource: 'RBAC',
          details: 'Nightly permission sync',
        },
      ],
    };
  },

  async inviteMember(email: string, role: string) {
    return { success: true, inviteId: `inv_${Date.now()}`, message: `Invite sent to ${email}` };
  },

  async updateRole(memberId: string, roleId: string) {
    return { success: true, message: `Member ${memberId} role updated to ${roleId}` };
  },
};

export async function GET() {
  try {
    const data = await teamService.getTeamData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, role, memberId, roleId } = body;

    switch (action) {
      case 'invite':
        if (!email || !role)
          return NextResponse.json(
            { success: false, error: 'Missing email or role' },
            { status: 400 }
          );
        const inviteResult = await teamService.inviteMember(email, role);
        return NextResponse.json({ ...inviteResult, success: true });
      case 'updateRole':
        if (!memberId || !roleId)
          return NextResponse.json(
            { success: false, error: 'Missing memberId or roleId' },
            { status: 400 }
          );
        const updateResult = await teamService.updateRole(memberId, roleId);
        return NextResponse.json({ ...updateResult, success: true });
      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'Operation failed' }, { status: 500 });
  }
}
