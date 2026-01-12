/**
 * @jest-environment node
 */
import { GET, POST } from '../route';
import { NextRequest } from 'next/server';

function createRequest(url: string, options?: RequestInit): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'), options);
}

describe('Workflows API', () => {
  describe('GET', () => {
    it('returns execution history', async () => {
      const req = createRequest('http://localhost:3000/api/workflows');
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('runs');
      expect(data).toHaveProperty('total');
    });

    it('returns 404 for non-existent run', async () => {
      const req = createRequest('http://localhost:3000/api/workflows?runId=fake');
      const res = await GET(req);
      expect(res.status).toBe(404);
    });

    it('returns runs filtered by workflowId', async () => {
      const req = createRequest('http://localhost:3000/api/workflows?workflowId=wf-pr-review');
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('runs');
    });

    it('returns specific run by id', async () => {
      const req = createRequest('http://localhost:3000/api/workflows?runId=run-001');
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.id).toBe('run-001');
    });
  });

  describe('POST - validate', () => {
    it('returns 400 without workflow', async () => {
      const req = createRequest('http://localhost:3000/api/workflows', {
        method: 'POST',
        body: JSON.stringify({ action: 'validate' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('returns valid for correct workflow', async () => {
      const workflow = {
        id: 'wf-test',
        name: 'Test Workflow',
        nodes: [
          { id: 'n1', type: 'trigger', name: 'Start' },
          { id: 'n2', type: 'action', name: 'Do Something', config: { foo: 'bar' } },
        ],
        edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const req = createRequest('http://localhost:3000/api/workflows', {
        method: 'POST',
        body: JSON.stringify({ action: 'validate', workflow }),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.valid).toBe(true);
    });

    it('returns invalid for empty workflow', async () => {
      const workflow = { id: 'wf-empty', name: 'Empty', nodes: [], edges: [], createdAt: '', updatedAt: '' };
      const req = createRequest('http://localhost:3000/api/workflows', {
        method: 'POST',
        body: JSON.stringify({ action: 'validate', workflow }),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.valid).toBe(false);
      expect(data.errors.length).toBeGreaterThan(0);
    });

    it('detects missing trigger', async () => {
      const workflow = {
        id: 'wf-no-trigger',
        name: 'No Trigger',
        nodes: [{ id: 'n1', type: 'action', name: 'Action' }],
        edges: [],
        createdAt: '',
        updatedAt: '',
      };
      const req = createRequest('http://localhost:3000/api/workflows', {
        method: 'POST',
        body: JSON.stringify({ action: 'validate', workflow }),
      });
      const res = await POST(req);
      const data = await res.json();
      expect(data.errors.some((e: { code: string }) => e.code === 'NO_TRIGGER')).toBe(true);
    });

    it('warns on missing config', async () => {
      const workflow = {
        id: 'wf-missing-config',
        name: 'Missing Config',
        nodes: [
          { id: 'n1', type: 'trigger', name: 'Start' },
          { id: 'n2', type: 'action', name: 'No Config' },
        ],
        edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
        createdAt: '',
        updatedAt: '',
      };
      const req = createRequest('http://localhost:3000/api/workflows', {
        method: 'POST',
        body: JSON.stringify({ action: 'validate', workflow }),
      });
      const res = await POST(req);
      const data = await res.json();
      expect(data.warnings.some((w: { code: string }) => w.code === 'MISSING_CONFIG')).toBe(true);
    });
  });

  describe('POST - execute', () => {
    it('starts workflow execution', async () => {
      const workflow = { id: 'wf-exec', name: 'Exec' };
      const req = createRequest('http://localhost:3000/api/workflows', {
        method: 'POST',
        body: JSON.stringify({ action: 'execute', workflow, trigger: 'Manual' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(202);
      const data = await res.json();
      expect(data).toHaveProperty('run');
      expect(data.run.status).toBe('running');
    });
  });

  describe('POST - invalid action', () => {
    it('returns 400', async () => {
      const req = createRequest('http://localhost:3000/api/workflows', {
        method: 'POST',
        body: JSON.stringify({ action: 'unknown' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });
});
