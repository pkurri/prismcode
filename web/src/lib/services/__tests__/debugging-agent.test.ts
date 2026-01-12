import { analyzeError, getDebugPatterns, generateAutonomousFix } from '../debugging-agent';

describe('Service: Debugging Agent', () => {
  it('analyzes error', async () => {
    const session = await analyzeError('NullPointer', 'at line 10');
    expect(session.status).toBe('resolved');
    expect(session.suggestion).toBeDefined();
    expect(session.id).toContain('debug-');
  });

  it('returns patterns', () => {
    const patterns = getDebugPatterns();
    expect(patterns.length).toBeGreaterThan(0);
    expect(patterns[0].pattern).toBeDefined();
  });

  it('generates autonomous fix', async () => {
    const session = await analyzeError('NullPointer', 'at line 10');
    const fix = await generateAutonomousFix(session);
    expect(fix).toContain('Auto-fix');
    expect(fix).toContain('if (value === null)');
  });
});
