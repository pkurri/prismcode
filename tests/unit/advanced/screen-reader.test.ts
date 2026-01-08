import { ScreenReaderSimulator } from '../../../src/advanced/screen-reader';

describe('ScreenReaderSimulator', () => {
  let simulator: ScreenReaderSimulator;

  beforeEach(() => {
    simulator = new ScreenReaderSimulator();
  });

  describe('simulateRead', () => {
    it('should detect images with missing alt text', async () => {
      const html = '<img src="test.jpg">';
      const results = await simulator.simulateRead(html);

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].issues.some((i) => i.type === 'missing-alt')).toBe(true);
    });

    it('should pass images with alt text', async () => {
      const html = '<img src="test.jpg" alt="Description">';
      const results = await simulator.simulateRead(html);

      expect(results[0].issues.length).toBe(0);
    });

    it('should detect empty links', async () => {
      const html = '<a href="/page"></a>';
      const results = await simulator.simulateRead(html);

      expect(results.some((r) => r.issues.some((i) => i.type === 'empty-link'))).toBe(true);
    });

    it('should read buttons correctly', async () => {
      const html = '<button>Click me</button>';
      const results = await simulator.simulateRead(html);

      expect(results.some((r) => r.role === 'button')).toBe(true);
    });
  });

  describe('simulateNavigation', () => {
    it('should count keystrokes to target', async () => {
      const html = '<button>One</button><a href="#">Two</a><button>Target</button>';
      const path = await simulator.simulateNavigation(html, 'Target');

      expect(path.keystrokes).toBe(3);
    });
  });

  describe('simulateHeadingNavigation', () => {
    it('should navigate through headings', () => {
      const html = '<h1>Title</h1><h2>Section</h2><h3>Subsection</h3>';
      const steps = simulator.simulateHeadingNavigation(html);

      expect(steps.length).toBe(3);
      expect(steps[0].announcement).toContain('level 1');
    });
  });

  describe('calculateScore', () => {
    it('should calculate accessibility score', async () => {
      const html = '<img src="a.jpg"><img src="b.jpg" alt="test">';
      const results = await simulator.simulateRead(html);
      const score = simulator.calculateScore(results);

      expect(score).toBe(50); // 1 of 2 elements has issues
    });
  });
});
