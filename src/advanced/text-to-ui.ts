/**
 * Text-to-UI Generation Engine
 * Issue #190: Text-to-UI Generation Engine
 *
 * Converts natural language descriptions into UI component code
 */

import logger from '../utils/logger';

export type ComponentType =
  | 'button'
  | 'input'
  | 'form'
  | 'card'
  | 'modal'
  | 'table'
  | 'list'
  | 'navbar'
  | 'footer'
  | 'hero'
  | 'sidebar'
  | 'alert'
  | 'badge'
  | 'dropdown'
  | 'tabs'
  | 'custom';

export type FrameworkType = 'html' | 'react' | 'vue' | 'svelte';

export interface GenerationConfig {
  framework: FrameworkType;
  includeStyles: boolean;
  styleFramework: 'css' | 'tailwind' | 'styled-components';
  includeAccessibility: boolean;
  responsiveDesign: boolean;
}

export interface GeneratedComponent {
  id: string;
  type: ComponentType;
  description: string;
  code: string;
  styles: string;
  framework: FrameworkType;
  properties: Record<string, unknown>;
  generatedAt: Date;
}

export interface GenerationResult {
  success: boolean;
  component: GeneratedComponent | null;
  suggestions: string[];
  parseConfidence: number;
  generationTime: number;
}

export interface ParsedIntent {
  componentType: ComponentType;
  properties: Record<string, unknown>;
  styles: Record<string, string>;
  content: string;
  confidence: number;
}

const DEFAULT_CONFIG: GenerationConfig = {
  framework: 'html',
  includeStyles: true,
  styleFramework: 'css',
  includeAccessibility: true,
  responsiveDesign: true,
};

// Component patterns for intent detection
const COMPONENT_PATTERNS: Array<{ type: ComponentType; patterns: RegExp[] }> = [
  {
    type: 'button',
    patterns: [/button/i, /btn/i, /cta/i, /call.to.action/i, /click/i],
  },
  {
    type: 'input',
    patterns: [/input/i, /text.?field/i, /text.?box/i, /form.?field/i],
  },
  {
    type: 'form',
    patterns: [/form/i, /sign.?up/i, /login/i, /contact/i, /registration/i],
  },
  {
    type: 'card',
    patterns: [/card/i, /tile/i, /panel/i, /box/i],
  },
  {
    type: 'modal',
    patterns: [/modal/i, /dialog/i, /popup/i, /overlay/i],
  },
  {
    type: 'table',
    patterns: [/table/i, /grid/i, /data.?table/i, /list.?view/i],
  },
  {
    type: 'list',
    patterns: [/list/i, /items/i, /menu/i, /options/i],
  },
  {
    type: 'navbar',
    patterns: [/nav/i, /header/i, /menu.?bar/i, /navigation/i],
  },
  {
    type: 'footer',
    patterns: [/footer/i, /bottom/i],
  },
  {
    type: 'hero',
    patterns: [/hero/i, /banner/i, /splash/i, /landing/i],
  },
  {
    type: 'sidebar',
    patterns: [/sidebar/i, /side.?nav/i, /drawer/i],
  },
  {
    type: 'alert',
    patterns: [/alert/i, /notification/i, /toast/i, /message/i, /warning/i],
  },
  {
    type: 'badge',
    patterns: [/badge/i, /tag/i, /chip/i, /label/i],
  },
  {
    type: 'dropdown',
    patterns: [/dropdown/i, /select/i, /combobox/i, /picker/i],
  },
  {
    type: 'tabs',
    patterns: [/tabs?/i, /tab.?panel/i, /tab.?view/i],
  },
];

// Style patterns for property extraction
const STYLE_PATTERNS: Array<{ property: string; patterns: RegExp[] }> = [
  { property: 'color', patterns: [/blue/i, /red/i, /green/i, /purple/i, /primary/i, /secondary/i] },
  { property: 'size', patterns: [/small/i, /medium/i, /large/i, /xl/i, /compact/i] },
  { property: 'rounded', patterns: [/rounded/i, /circular/i, /pill/i] },
  { property: 'shadow', patterns: [/shadow/i, /elevated/i, /floating/i] },
  { property: 'bordered', patterns: [/bordered?/i, /outlined?/i] },
  { property: 'centered', patterns: [/center/i, /middle/i] },
  { property: 'fullWidth', patterns: [/full.?width/i, /stretch/i, /100%/i] },
];

/**
 * Text-to-UI Generation Engine
 * Converts natural language descriptions into UI components
 */
export class TextToUIEngine {
  private config: GenerationConfig;
  private generatedComponents: Map<string, GeneratedComponent> = new Map();

  constructor(config: Partial<GenerationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    logger.info('TextToUIEngine initialized', {
      framework: this.config.framework,
      styleFramework: this.config.styleFramework,
    });
  }

  /**
   * Generate UI component from natural language description
   */
  generate(description: string): GenerationResult {
    const startTime = Date.now();

    if (!description || description.trim().length === 0) {
      return {
        success: false,
        component: null,
        suggestions: ['Please provide a description of the UI component you want to create'],
        parseConfidence: 0,
        generationTime: Date.now() - startTime,
      };
    }

    // Parse the intent from description
    const intent = this.parseIntent(description);

    // Generate the component
    const component = this.generateComponent(intent, description);

    // Store generated component
    this.generatedComponents.set(component.id, component);

    const result: GenerationResult = {
      success: true,
      component,
      suggestions: this.generateSuggestions(intent),
      parseConfidence: intent.confidence,
      generationTime: Date.now() - startTime,
    };

    logger.info('Component generated', {
      id: component.id,
      type: component.type,
      confidence: intent.confidence,
      generationTime: result.generationTime,
    });

    return result;
  }

  /**
   * Parse natural language into structured intent
   */
  parseIntent(description: string): ParsedIntent {
    const lowerDesc = description.toLowerCase();

    // Detect component type
    let componentType: ComponentType = 'custom';
    let typeConfidence = 0;

    for (const { type, patterns } of COMPONENT_PATTERNS) {
      for (const pattern of patterns) {
        if (pattern.test(lowerDesc)) {
          componentType = type;
          typeConfidence = 0.8;
          break;
        }
      }
      if (componentType !== 'custom') break;
    }

    // Extract style properties
    const styles: Record<string, string> = {};
    for (const { property, patterns } of STYLE_PATTERNS) {
      for (const pattern of patterns) {
        const match = lowerDesc.match(pattern);
        if (match) {
          styles[property] = match[0];
        }
      }
    }

    // Extract content hints
    const contentMatch = description.match(/["']([^"']+)["']/);
    const content = contentMatch ? contentMatch[1] : this.getDefaultContent(componentType);

    // Calculate overall confidence
    const confidence = componentType === 'custom' ? 0.3 : typeConfidence;

    return {
      componentType,
      properties: this.extractProperties(description),
      styles,
      content,
      confidence,
    };
  }

  /**
   * Generate component code based on intent
   */
  private generateComponent(intent: ParsedIntent, description: string): GeneratedComponent {
    const id = this.generateId();

    const code = this.generateCode(intent);
    const styles = this.config.includeStyles ? this.generateStyles(intent) : '';

    return {
      id,
      type: intent.componentType,
      description,
      code,
      styles,
      framework: this.config.framework,
      properties: intent.properties,
      generatedAt: new Date(),
    };
  }

  /**
   * Generate code based on framework
   */
  private generateCode(intent: ParsedIntent): string {
    switch (this.config.framework) {
      case 'react':
        return this.generateReactCode(intent);
      case 'vue':
        return this.generateVueCode(intent);
      case 'svelte':
        return this.generateSvelteCode(intent);
      default:
        return this.generateHtmlCode(intent);
    }
  }

  private generateHtmlCode(intent: ParsedIntent): string {
    const { componentType, content, styles } = intent;
    const className = this.getClassName(componentType, styles);
    const a11y = this.config.includeAccessibility ? this.getAccessibilityAttrs(componentType) : '';

    switch (componentType) {
      case 'button':
        return `<button class="${className}"${a11y}>${content}</button>`;
      case 'input':
        return `<input type="text" class="${className}" placeholder="${content}"${a11y} />`;
      case 'card':
        return `<div class="${className}"${a11y}>
  <div class="card-body">
    <h3 class="card-title">${content}</h3>
    <p class="card-text">Card content goes here</p>
  </div>
</div>`;
      case 'alert':
        return `<div class="${className}" role="alert"${a11y}>
  ${content}
</div>`;
      case 'badge':
        return `<span class="${className}"${a11y}>${content}</span>`;
      case 'navbar':
        return `<nav class="${className}"${a11y}>
  <a href="/" class="nav-brand">Brand</a>
  <ul class="nav-links">
    <li><a href="#">Home</a></li>
    <li><a href="#">About</a></li>
    <li><a href="#">Contact</a></li>
  </ul>
</nav>`;
      default:
        return `<div class="${className}"${a11y}>${content}</div>`;
    }
  }

  private generateReactCode(intent: ParsedIntent): string {
    const { componentType, content, styles } = intent;
    const className = this.getClassName(componentType, styles);
    const componentName = this.toComponentName(componentType);

    switch (componentType) {
      case 'button':
        return `export function ${componentName}({ onClick, children = "${content}" }) {
  return (
    <button className="${className}" onClick={onClick}>
      {children}
    </button>
  );
}`;
      case 'card':
        return `export function ${componentName}({ title = "${content}", children }) {
  return (
    <div className="${className}">
      <div className="card-body">
        <h3 className="card-title">{title}</h3>
        <div className="card-content">{children}</div>
      </div>
    </div>
  );
}`;
      default:
        return `export function ${componentName}({ children }) {
  return (
    <div className="${className}">
      {children || "${content}"}
    </div>
  );
}`;
    }
  }

  private generateVueCode(intent: ParsedIntent): string {
    const { componentType, content, styles } = intent;
    const className = this.getClassName(componentType, styles);

    switch (componentType) {
      case 'button':
        return `<template>
  <button class="${className}" @click="$emit('click')">
    <slot>${content}</slot>
  </button>
</template>

<script>
export default {
  name: '${this.toComponentName(componentType)}',
  emits: ['click']
}
</script>`;
      default:
        return `<template>
  <div class="${className}">
    <slot>${content}</slot>
  </div>
</template>

<script>
export default {
  name: '${this.toComponentName(componentType)}'
}
</script>`;
    }
  }

  private generateSvelteCode(intent: ParsedIntent): string {
    const { componentType, content, styles } = intent;
    const className = this.getClassName(componentType, styles);

    switch (componentType) {
      case 'button':
        return `<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<button class="${className}" on:click={() => dispatch('click')}>
  <slot>${content}</slot>
</button>`;
      default:
        return `<div class="${className}">
  <slot>${content}</slot>
</div>`;
    }
  }

  private generateStyles(intent: ParsedIntent): string {
    const { componentType, styles } = intent;
    const baseClass = componentType;

    let css = `.${baseClass} {\n`;

    // Base styles
    css += '  display: block;\n';

    // Color
    if (styles.color) {
      const colorMap: Record<string, string> = {
        blue: '#3b82f6',
        red: '#ef4444',
        green: '#22c55e',
        purple: '#a855f7',
        primary: '#3b82f6',
        secondary: '#6b7280',
      };
      css += `  background-color: ${colorMap[styles.color.toLowerCase()] || '#3b82f6'};\n`;
      css += '  color: white;\n';
    }

    // Size
    if (styles.size) {
      const sizeMap: Record<string, string> = {
        small: '0.5rem 1rem',
        medium: '0.75rem 1.5rem',
        large: '1rem 2rem',
      };
      css += `  padding: ${sizeMap[styles.size.toLowerCase()] || '0.75rem 1.5rem'};\n`;
    }

    // Rounded
    if (styles.rounded) {
      css += '  border-radius: 0.5rem;\n';
    }

    // Shadow
    if (styles.shadow) {
      css += '  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);\n';
    }

    // Border
    if (styles.bordered) {
      css += '  border: 1px solid currentColor;\n';
    }

    // Centered
    if (styles.centered) {
      css += '  text-align: center;\n';
    }

    // Full width
    if (styles.fullWidth) {
      css += '  width: 100%;\n';
    }

    css += '}\n';

    return css;
  }

  private getClassName(type: ComponentType, styles: Record<string, string>): string {
    const classes: string[] = [type];

    for (const key of Object.keys(styles)) {
      classes.push(`${type}--${key}`);
    }

    return classes.join(' ');
  }

  private getAccessibilityAttrs(type: ComponentType): string {
    switch (type) {
      case 'button':
        return ' type="button"';
      case 'input':
        return ' aria-label="Input field"';
      case 'modal':
        return ' role="dialog" aria-modal="true"';
      case 'navbar':
        return ' aria-label="Main navigation"';
      case 'alert':
        return ' aria-live="polite"';
      default:
        return '';
    }
  }

  private getDefaultContent(type: ComponentType): string {
    const defaults: Record<ComponentType, string> = {
      button: 'Click me',
      input: 'Enter text...',
      form: 'Submit',
      card: 'Card Title',
      modal: 'Modal Title',
      table: 'Data Table',
      list: 'List Item',
      navbar: 'Navigation',
      footer: 'Footer',
      hero: 'Welcome',
      sidebar: 'Sidebar',
      alert: 'Important message',
      badge: 'Badge',
      dropdown: 'Select option',
      tabs: 'Tab',
      custom: 'Content',
    };
    return defaults[type] || 'Content';
  }

  private toComponentName(type: ComponentType): string {
    return type.charAt(0).toUpperCase() + type.slice(1) + 'Component';
  }

  private extractProperties(description: string): Record<string, unknown> {
    const props: Record<string, unknown> = {};

    // Extract common properties
    if (/disabled/i.test(description)) props.disabled = true;
    if (/required/i.test(description)) props.required = true;
    if (/loading/i.test(description)) props.loading = true;
    if (/icon/i.test(description)) props.hasIcon = true;

    return props;
  }

  private generateSuggestions(intent: ParsedIntent): string[] {
    const suggestions: string[] = [];

    if (intent.confidence < 0.5) {
      suggestions.push(
        'Try being more specific about the component type (e.g., "button", "card", "form")'
      );
    }

    if (Object.keys(intent.styles).length === 0) {
      suggestions.push(
        'You can add styling hints like "blue", "rounded", "large", or "with shadow"'
      );
    }

    if (!intent.content || intent.content === this.getDefaultContent(intent.componentType)) {
      suggestions.push('Include text content in quotes, e.g., "Submit Order" for button text');
    }

    return suggestions;
  }

  private generateId(): string {
    return `ui_${Date.now().toString(16)}_${Math.random().toString(16).slice(2, 8)}`;
  }

  // Public utility methods

  /**
   * Get a generated component by ID
   */
  getComponent(id: string): GeneratedComponent | undefined {
    return this.generatedComponents.get(id);
  }

  /**
   * Get all generated components
   */
  getAllComponents(): GeneratedComponent[] {
    return Array.from(this.generatedComponents.values());
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<GenerationConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('TextToUIEngine config updated', { config: this.config });
  }

  /**
   * Get current configuration
   */
  getConfig(): GenerationConfig {
    return { ...this.config };
  }

  /**
   * Clear all generated components
   */
  clearHistory(): void {
    this.generatedComponents.clear();
    logger.info('Generation history cleared');
  }

  /**
   * Get supported component types
   */
  getSupportedTypes(): ComponentType[] {
    return COMPONENT_PATTERNS.map((p) => p.type);
  }

  /**
   * Get supported frameworks
   */
  getSupportedFrameworks(): FrameworkType[] {
    return ['html', 'react', 'vue', 'svelte'];
  }
}

// Singleton instance
export const textToUI = new TextToUIEngine();

/**
 * Quick generation helper
 */
export function generateUI(
  description: string,
  framework: FrameworkType = 'html'
): GenerationResult {
  const engine = new TextToUIEngine({ framework });
  return engine.generate(description);
}
