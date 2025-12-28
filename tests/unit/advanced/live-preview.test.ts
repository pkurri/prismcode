import {
  LivePreviewRenderer,
  PreviewState,
  PreviewError,
  RenderResult,
  renderPreview,
} from '../../../src/advanced/live-preview';

describe('Live Preview Iframe Renderer', () => {
  let renderer: LivePreviewRenderer;

  beforeEach(() => {
    renderer = new LivePreviewRenderer();
  });

  afterEach(() => {
    renderer.clearAll();
  });

  describe('Preview Creation', () => {
    it('should create a new preview', () => {
      const preview = renderer.createPreview();

      expect(preview.id).toBeDefined();
      expect(preview.html).toBe('');
      expect(preview.css).toBe('');
      expect(preview.js).toBe('');
      expect(preview.lastUpdated).toBeInstanceOf(Date);
      expect(preview.errors).toHaveLength(0);
    });

    it('should create preview with custom ID', () => {
      const preview = renderer.createPreview('my-preview');

      expect(preview.id).toBe('my-preview');
    });

    it('should track multiple previews', () => {
      renderer.createPreview('preview-1');
      renderer.createPreview('preview-2');
      renderer.createPreview('preview-3');

      expect(renderer.getAllPreviewIds()).toHaveLength(3);
    });
  });

  describe('Preview Updates', () => {
    it('should update HTML content', () => {
      const preview = renderer.createPreview();
      const updated = renderer.updatePreview(preview.id, { html: '<h1>Hello</h1>' });

      expect(updated.html).toBe('<h1>Hello</h1>');
    });

    it('should update CSS content', () => {
      const preview = renderer.createPreview();
      const updated = renderer.updatePreview(preview.id, { css: 'h1 { color: red; }' });

      expect(updated.css).toBe('h1 { color: red; }');
    });

    it('should update JS content', () => {
      const preview = renderer.createPreview();
      const updated = renderer.updatePreview(preview.id, { js: 'console.log("test");' });

      expect(updated.js).toBe('console.log("test");');
    });

    it('should update multiple properties at once', () => {
      const preview = renderer.createPreview();
      const updated = renderer.updatePreview(preview.id, {
        html: '<div>Test</div>',
        css: 'div { padding: 10px; }',
        js: 'document.querySelector("div").textContent = "Updated";',
      });

      expect(updated.html).toBe('<div>Test</div>');
      expect(updated.css).toBe('div { padding: 10px; }');
      expect(updated.js).toContain('querySelector');
    });

    it('should throw for non-existent preview', () => {
      expect(() => renderer.updatePreview('invalid-id', { html: 'test' })).toThrow(
        'Preview not found'
      );
    });

    it('should update lastUpdated timestamp', () => {
      const preview = renderer.createPreview();
      const originalTime = preview.lastUpdated;

      // Small delay to ensure different timestamp
      const updated = renderer.updatePreview(preview.id, { html: 'new' });

      expect(updated.lastUpdated.getTime()).toBeGreaterThanOrEqual(originalTime.getTime());
    });
  });

  describe('Rendering', () => {
    it('should render basic HTML', () => {
      const preview = renderer.createPreview();
      renderer.updatePreview(preview.id, { html: '<h1>Hello World</h1>' });

      const result = renderer.render(preview.id);

      expect(result.success).toBe(true);
      expect(result.html).toContain('<h1>Hello World</h1>');
      expect(result.html).toContain('<!DOCTYPE html>');
    });

    it('should include CSS in rendered output', () => {
      const preview = renderer.createPreview();
      renderer.updatePreview(preview.id, {
        html: '<div class="box">Box</div>',
        css: '.box { background: blue; }',
      });

      const result = renderer.render(preview.id);

      expect(result.html).toContain('.box { background: blue; }');
    });

    it('should include JS in rendered output', () => {
      const preview = renderer.createPreview();
      renderer.updatePreview(preview.id, {
        html: '<button>Click</button>',
        js: 'console.log("loaded");',
      });

      const result = renderer.render(preview.id);

      expect(result.html).toContain('console.log("loaded")');
    });

    it('should include default styles', () => {
      const preview = renderer.createPreview();
      renderer.updatePreview(preview.id, { html: '<p>Text</p>' });

      const result = renderer.render(preview.id);

      expect(result.html).toContain('box-sizing: border-box');
    });

    it('should return error for non-existent preview', () => {
      const result = renderer.render('invalid-id');

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('runtime');
    });

    it('should track render time', () => {
      const preview = renderer.createPreview();
      renderer.updatePreview(preview.id, { html: '<p>Test</p>' });

      const result = renderer.render(preview.id);

      expect(result.renderTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Validation', () => {
    it('should detect unbalanced CSS braces', () => {
      const preview = renderer.createPreview();
      renderer.updatePreview(preview.id, {
        html: '<div>Test</div>',
        css: '.class { color: red;',
      });

      const result = renderer.render(preview.id);

      expect(result.errors.some((e) => e.type === 'css')).toBe(true);
    });

    it('should detect unbalanced JS braces', () => {
      const preview = renderer.createPreview();
      renderer.updatePreview(preview.id, {
        html: '<div>Test</div>',
        js: 'function foo() {',
      });

      const result = renderer.render(preview.id);

      expect(result.errors.some((e) => e.type === 'js')).toBe(true);
    });

    it('should detect unbalanced JS parentheses', () => {
      const preview = renderer.createPreview();
      renderer.updatePreview(preview.id, {
        html: '<div>Test</div>',
        js: 'console.log("test"',
      });

      const result = renderer.render(preview.id);

      expect(result.errors.some((e) => e.type === 'js')).toBe(true);
    });

    it('should pass validation for correct code', () => {
      const preview = renderer.createPreview();
      renderer.updatePreview(preview.id, {
        html: '<div><span>Hello</span></div>',
        css: '.class { color: red; }',
        js: 'console.log("test");',
      });

      const result = renderer.render(preview.id);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Debounced Rendering', () => {
    it('should call callback after debounce', (done) => {
      const preview = renderer.createPreview();
      renderer.updatePreview(preview.id, { html: '<p>Test</p>' });

      renderer.renderDebounced(preview.id, (result) => {
        expect(result.success).toBe(true);
        done();
      });
    });

    it('should debounce multiple rapid calls', (done) => {
      const customRenderer = new LivePreviewRenderer({ refreshDebounceMs: 100 });
      const preview = customRenderer.createPreview();
      let callCount = 0;

      // Make multiple rapid updates
      customRenderer.updatePreview(preview.id, { html: '<p>1</p>' });
      customRenderer.renderDebounced(preview.id, () => callCount++);

      customRenderer.updatePreview(preview.id, { html: '<p>2</p>' });
      customRenderer.renderDebounced(preview.id, () => callCount++);

      customRenderer.updatePreview(preview.id, { html: '<p>3</p>' });
      customRenderer.renderDebounced(preview.id, (result) => {
        callCount++;
        // Only the last callback should execute
        expect(callCount).toBe(1);
        expect(result.html).toContain('<p>3</p>');
        customRenderer.clearAll();
        done();
      });
    });
  });

  describe('Preview Management', () => {
    it('should get preview by ID', () => {
      const created = renderer.createPreview('test-id');
      const retrieved = renderer.getPreview('test-id');

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
    });

    it('should return undefined for non-existent preview', () => {
      const preview = renderer.getPreview('invalid-id');
      expect(preview).toBeUndefined();
    });

    it('should delete preview', () => {
      const preview = renderer.createPreview();
      const deleted = renderer.deletePreview(preview.id);

      expect(deleted).toBe(true);
      expect(renderer.getPreview(preview.id)).toBeUndefined();
    });

    it('should return false when deleting non-existent preview', () => {
      const deleted = renderer.deletePreview('invalid-id');
      expect(deleted).toBe(false);
    });

    it('should clear all previews', () => {
      renderer.createPreview('p1');
      renderer.createPreview('p2');
      renderer.createPreview('p3');

      renderer.clearAll();

      expect(renderer.getAllPreviewIds()).toHaveLength(0);
    });
  });

  describe('Configuration', () => {
    it('should use default configuration', () => {
      const config = renderer.getConfig();

      expect(config.refreshDebounceMs).toBe(300);
      expect(config.maxHeight).toBe(600);
      expect(config.enableConsoleCapture).toBe(true);
    });

    it('should accept custom configuration', () => {
      const customRenderer = new LivePreviewRenderer({
        refreshDebounceMs: 500,
        maxHeight: 800,
      });

      const config = customRenderer.getConfig();

      expect(config.refreshDebounceMs).toBe(500);
      expect(config.maxHeight).toBe(800);
    });

    it('should update configuration', () => {
      renderer.updateConfig({ refreshDebounceMs: 1000 });

      expect(renderer.getConfig().refreshDebounceMs).toBe(1000);
    });

    it('should generate sandbox attribute', () => {
      const sandbox = renderer.getSandboxAttribute();

      expect(sandbox).toContain('allow-scripts');
      expect(sandbox).toContain('allow-same-origin');
    });
  });

  describe('Console Capture', () => {
    it('should include console capture script when enabled', () => {
      const preview = renderer.createPreview();
      renderer.updatePreview(preview.id, { html: '<div>Test</div>' });

      const result = renderer.render(preview.id);

      expect(result.html).toContain('originalConsole');
      expect(result.html).toContain('postMessage');
    });

    it('should not include console capture when disabled', () => {
      const customRenderer = new LivePreviewRenderer({ enableConsoleCapture: false });
      const preview = customRenderer.createPreview();
      customRenderer.updatePreview(preview.id, { html: '<div>Test</div>' });

      const result = customRenderer.render(preview.id);

      expect(result.html).not.toContain('originalConsole');
    });
  });

  describe('Helper Function', () => {
    it('should render preview using helper function', () => {
      const result = renderPreview('<h1>Quick Test</h1>', 'h1 { color: blue; }', '');

      expect(result.success).toBe(true);
      expect(result.html).toContain('<h1>Quick Test</h1>');
      expect(result.html).toContain('h1 { color: blue; }');
    });
  });
});
