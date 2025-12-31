import {
  TextToUIEngine,
  GeneratedComponent,
  GenerationResult,
  ComponentType,
  FrameworkType,
  generateUI,
} from '../../../src/advanced/text-to-ui';

describe('Text-to-UI Generation Engine', () => {
  let engine: TextToUIEngine;

  beforeEach(() => {
    engine = new TextToUIEngine();
  });

  afterEach(() => {
    engine.clearHistory();
  });

  describe('Component Type Detection', () => {
    it('should detect button component', () => {
      const result = engine.generate('Create a blue button');

      expect(result.success).toBe(true);
      expect(result.component?.type).toBe('button');
    });

    it('should detect card component', () => {
      const result = engine.generate('I need a card with shadow');

      expect(result.success).toBe(true);
      expect(result.component?.type).toBe('card');
    });

    it('should detect form component', () => {
      const result = engine.generate('Build a login form');

      expect(result.success).toBe(true);
      expect(result.component?.type).toBe('form');
    });

    it('should detect navbar component', () => {
      const result = engine.generate('Create a navigation header');

      expect(result.success).toBe(true);
      expect(result.component?.type).toBe('navbar');
    });

    it('should detect alert component', () => {
      const result = engine.generate('Show a warning notification');

      expect(result.success).toBe(true);
      expect(result.component?.type).toBe('alert');
    });

    it('should detect modal component', () => {
      const result = engine.generate('Create a popup dialog');

      expect(result.success).toBe(true);
      expect(result.component?.type).toBe('modal');
    });

    it('should default to custom for unknown types', () => {
      const result = engine.generate('Create something weird and unusual');

      expect(result.success).toBe(true);
      expect(result.component?.type).toBe('custom');
      expect(result.parseConfidence).toBeLessThan(0.5);
    });
  });

  describe('Style Extraction', () => {
    it('should extract color property', () => {
      const result = engine.generate('Create a blue button');

      expect(result.component?.styles).toContain('#3b82f6');
    });

    it('should extract size property', () => {
      const result = engine.generate('Create a large button');
      const intent = engine.parseIntent('Create a large button');

      expect(intent.styles.size).toBeDefined();
    });

    it('should extract rounded property', () => {
      const intent = engine.parseIntent('Create a rounded button');

      expect(intent.styles.rounded).toBeDefined();
    });

    it('should extract shadow property', () => {
      const intent = engine.parseIntent('Create a card with shadow');

      expect(intent.styles.shadow).toBeDefined();
    });

    it('should extract multiple style properties', () => {
      const intent = engine.parseIntent('Create a large blue rounded button with shadow');

      expect(intent.styles.size).toBeDefined();
      expect(intent.styles.color).toBeDefined();
      expect(intent.styles.rounded).toBeDefined();
      expect(intent.styles.shadow).toBeDefined();
    });
  });

  describe('Content Extraction', () => {
    it('should extract quoted content', () => {
      const intent = engine.parseIntent('Create a button with text "Submit Order"');

      expect(intent.content).toBe('Submit Order');
    });

    it('should use default content when not specified', () => {
      const intent = engine.parseIntent('Create a button');

      expect(intent.content).toBe('Click me');
    });
  });

  describe('HTML Code Generation', () => {
    it('should generate HTML button', () => {
      const result = engine.generate('Create a button');

      expect(result.component?.code).toContain('<button');
      expect(result.component?.code).toContain('</button>');
    });

    it('should generate HTML input', () => {
      const result = engine.generate('Create an input field');

      expect(result.component?.code).toContain('<input');
      expect(result.component?.code).toContain('type="text"');
    });

    it('should generate HTML card', () => {
      const result = engine.generate('Create a card');

      expect(result.component?.code).toContain('<div class="card');
      expect(result.component?.code).toContain('card-body');
    });

    it('should generate HTML navbar', () => {
      const result = engine.generate('Create a navigation bar');

      expect(result.component?.code).toContain('<nav');
      expect(result.component?.code).toContain('nav-links');
    });

    it('should include accessibility attributes', () => {
      const result = engine.generate('Create a button');

      expect(result.component?.code).toContain('type="button"');
    });
  });

  describe('React Code Generation', () => {
    beforeEach(() => {
      engine = new TextToUIEngine({ framework: 'react' });
    });

    it('should generate React component', () => {
      const result = engine.generate('Create a button');

      expect(result.component?.code).toContain('export function');
      expect(result.component?.code).toContain('onClick');
    });

    it('should generate React card component', () => {
      const result = engine.generate('Create a card');

      expect(result.component?.code).toContain('export function CardComponent');
      expect(result.component?.code).toContain('className=');
    });

    it('should set framework to react', () => {
      const result = engine.generate('Create a button');

      expect(result.component?.framework).toBe('react');
    });
  });

  describe('Vue Code Generation', () => {
    beforeEach(() => {
      engine = new TextToUIEngine({ framework: 'vue' });
    });

    it('should generate Vue component', () => {
      const result = engine.generate('Create a button');

      expect(result.component?.code).toContain('<template>');
      expect(result.component?.code).toContain('@click=');
      expect(result.component?.code).toContain('<script>');
    });

    it('should include proper exports', () => {
      const result = engine.generate('Create a button');

      expect(result.component?.code).toContain('export default');
    });
  });

  describe('Svelte Code Generation', () => {
    beforeEach(() => {
      engine = new TextToUIEngine({ framework: 'svelte' });
    });

    it('should generate Svelte component', () => {
      const result = engine.generate('Create a button');

      expect(result.component?.code).toContain('<script>');
      expect(result.component?.code).toContain('createEventDispatcher');
      expect(result.component?.code).toContain('<slot>');
    });
  });

  describe('Style Generation', () => {
    it('should generate CSS styles', () => {
      const result = engine.generate('Create a blue button');

      expect(result.component?.styles).toContain('{');
      expect(result.component?.styles).toContain('}');
    });

    it('should include color in styles', () => {
      const result = engine.generate('Create a blue button');

      expect(result.component?.styles).toContain('background-color');
    });

    it('should include rounded in styles', () => {
      const result = engine.generate('Create a rounded button');

      expect(result.component?.styles).toContain('border-radius');
    });

    it('should not include styles when disabled', () => {
      engine = new TextToUIEngine({ includeStyles: false });
      const result = engine.generate('Create a button');

      expect(result.component?.styles).toBe('');
    });
  });

  describe('Property Extraction', () => {
    it('should detect disabled property', () => {
      const intent = engine.parseIntent('Create a disabled button');

      expect(intent.properties.disabled).toBe(true);
    });

    it('should detect required property', () => {
      const intent = engine.parseIntent('Create a required input');

      expect(intent.properties.required).toBe(true);
    });

    it('should detect loading property', () => {
      const intent = engine.parseIntent('Create a loading button');

      expect(intent.properties.loading).toBe(true);
    });

    it('should detect icon property', () => {
      const intent = engine.parseIntent('Create a button with icon');

      expect(intent.properties.hasIcon).toBe(true);
    });
  });

  describe('Generation Suggestions', () => {
    it('should suggest component type for low confidence', () => {
      const result = engine.generate('Create something');

      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions.some((s) => s.includes('specific'))).toBe(true);
    });

    it('should suggest styling for plain descriptions', () => {
      const result = engine.generate('Create a button');

      expect(result.suggestions.some((s) => s.includes('styling') || s.includes('blue'))).toBe(
        true
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle empty description', () => {
      const result = engine.generate('');

      expect(result.success).toBe(false);
      expect(result.component).toBeNull();
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should handle whitespace-only description', () => {
      const result = engine.generate('   ');

      expect(result.success).toBe(false);
    });
  });

  describe('Component Management', () => {
    it('should store generated components', () => {
      const result = engine.generate('Create a button');
      const retrieved = engine.getComponent(result.component!.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(result.component?.id);
    });

    it('should list all generated components', () => {
      engine.generate('Create a button');
      engine.generate('Create a card');
      engine.generate('Create an input');

      const all = engine.getAllComponents();

      expect(all).toHaveLength(3);
    });

    it('should clear history', () => {
      engine.generate('Create a button');
      engine.generate('Create a card');
      engine.clearHistory();

      expect(engine.getAllComponents()).toHaveLength(0);
    });
  });

  describe('Configuration', () => {
    it('should return supported component types', () => {
      const types = engine.getSupportedTypes();

      expect(types).toContain('button');
      expect(types).toContain('card');
      expect(types).toContain('form');
    });

    it('should return supported frameworks', () => {
      const frameworks = engine.getSupportedFrameworks();

      expect(frameworks).toContain('html');
      expect(frameworks).toContain('react');
      expect(frameworks).toContain('vue');
      expect(frameworks).toContain('svelte');
    });

    it('should update configuration', () => {
      engine.updateConfig({ framework: 'react' });

      expect(engine.getConfig().framework).toBe('react');
    });
  });

  describe('Performance', () => {
    it('should track generation time', () => {
      const result = engine.generate('Create a complex form with multiple inputs');

      expect(result.generationTime).toBeGreaterThanOrEqual(0);
    });

    it('should include parse confidence', () => {
      const result = engine.generate('Create a button');

      expect(result.parseConfidence).toBeGreaterThan(0);
      expect(result.parseConfidence).toBeLessThanOrEqual(1);
    });
  });

  describe('Helper Function', () => {
    it('should generate UI with helper function', () => {
      const result = generateUI('Create a blue button', 'html');

      expect(result.success).toBe(true);
      expect(result.component?.type).toBe('button');
    });

    it('should support different frameworks', () => {
      const reactResult = generateUI('Create a button', 'react');

      expect(reactResult.component?.framework).toBe('react');
    });
  });
});
