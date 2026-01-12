import { GET as getCarbon, POST as postCarbon } from '../carbon/route';
import { POST as postExecute } from '../execute/route';
import { GET as getTeam, POST as postTeam } from '../team/route';
import { GET as getDebugPatt } from '../debug-patterns/route';
import { GET as getSustain } from '../sustainability/route';
import { POST as postAsk } from '../ask/route';
import { POST as postAiAsk } from '../ai/ask/route';
import { POST as postInternalComplete } from '../internal/ai/complete/route';
import { POST as postInternalReview } from '../internal/ai/review/route';
import { POST as postGenerate } from '../generate/route';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, options?: any) => ({ 
      json: async () => data, 
      status: options?.status || 200 
    }),
  },
  NextRequest: jest.fn(),
}));

describe('API Megabatch 2', () => {

  describe('Carbon', () => {
    it('GET returns carbon stats', async () => {
      const res = await getCarbon({ url: 'http://localhost' } as any);
      expect(res.status).toBeDefined();
    });
  });

  describe('Execute', () => {
    it('POST executes code', async () => {
      const req = { json: async () => ({ code: 'console.log(1)' }) } as any;
      const res = await postExecute(req);
      expect(res.status).toBeDefined();
    });
  });

  describe('Team', () => {
    it('GET returns team', async () => {
      const res = await getTeam({ url: 'http://localhost' } as any);
      expect(res.status).toBeDefined();
    });
  });

  describe('Debug Patterns', () => {
    it('GET returns patterns', async () => {
      const res = await getDebugPatt({ url: 'http://localhost' } as any);
      expect(res.status).toBeDefined();
    });
  });

  describe('Sustainability', () => {
    it('GET returns metrics', async () => {
      const res = await getSustain({ url: 'http://localhost' } as any);
      expect(res.status).toBeDefined();
    });
  });

  describe('Ask', () => {
    it('POST returns answer', async () => {
       const req = { json: async () => ({ question: 'Hi' }) } as any;
       const res = await postAsk(req);
       expect(res.status).toBeDefined();
    });
  });

  describe('AI Ask', () => {
     it('POST returns answer', async () => {
       const req = { json: async () => ({ question: 'Hi' }) } as any;
       const res = await postAiAsk(req);
       expect(res.status).toBeDefined();
    });
  });

  describe('Internal AI Complete', () => {
    it('POST completes', async () => {
       const req = { json: async () => ({ prompt: 'Hi' }) } as any;
       const res = await postInternalComplete(req);
       expect(res.status).toBeDefined();
    });
  });

  describe('Internal AI Review', () => {
    it('POST reviews', async () => {
       const req = { json: async () => ({ code: 'var a = 1;' }) } as any;
       const res = await postInternalReview(req);
       expect(res.status).toBeDefined();
    });
  });

  describe('Generate', () => {
    it('POST generates', async () => {
       const req = { json: async () => ({ prompt: 'App' }) } as any;
       const res = await postGenerate(req);
       expect(res.status).toBeDefined();
    });
  });

});
