import { multimodalEngine } from '../../../src/advanced/multimodal';

describe('MultimodalEngine', () => {
  describe('screenshotToCode', () => {
    it('should generate React component from screenshot', async () => {
      const result = await multimodalEngine.screenshotToCode('base64imagedata', 'react');

      expect(result).toBeDefined();
      expect(result.framework).toBe('react');
      expect(result.code).toContain('export function');
      expect(result.components.length).toBeGreaterThan(0);
    });

    it('should generate HTML from screenshot', async () => {
      const result = await multimodalEngine.screenshotToCode('base64imagedata', 'html');

      expect(result.framework).toBe('html');
      expect(result.code).toContain('<div');
    });
  });

  describe('validateDiagram', () => {
    it('should validate architecture diagram against codebase', async () => {
      const codebaseFiles = [
        'src/api-gateway.ts',
        'src/services/auth-service.ts',
        'src/db/user-database.ts',
      ];

      const result = await multimodalEngine.validateDiagram('diagramBase64', codebaseFiles);

      expect(result).toBeDefined();
      expect(result.diagramType).toBe('architecture');
      expect(result.detectedComponents.length).toBeGreaterThan(0);
      expect(typeof result.score).toBe('number');
    });

    it('should detect drift when components are missing', async () => {
      const result = await multimodalEngine.validateDiagram('diagramBase64', []);

      expect(result.isValid).toBe(false);
      expect(result.driftIssues.length).toBeGreaterThan(0);
    });
  });

  describe('analyzeImage', () => {
    it('should analyze image and return UI elements', async () => {
      const result = await multimodalEngine.analyzeImage('imageBase64');

      expect(result.description).toBeDefined();
      expect(result.detectedElements.length).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);
    });
  });
});
