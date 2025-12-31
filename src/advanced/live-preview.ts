/**
 * Live Preview Iframe Renderer
 * Issue #189: Live Preview Iframe Renderer
 *
 * Provides real-time preview of HTML/CSS/JS code in a sandboxed iframe
 */

import logger from '../utils/logger';

export interface PreviewConfig {
  sandboxPermissions: string[];
  defaultStyles: string;
  refreshDebounceMs: number;
  maxHeight: number;
  enableConsoleCapture: boolean;
}

export interface PreviewState {
  id: string;
  html: string;
  css: string;
  js: string;
  lastUpdated: Date;
  errors: PreviewError[];
  consoleOutput: ConsoleEntry[];
}

export interface PreviewError {
  type: 'html' | 'css' | 'js' | 'runtime';
  message: string;
  line?: number;
  column?: number;
  timestamp: Date;
}

export interface ConsoleEntry {
  level: 'log' | 'warn' | 'error' | 'info';
  message: string;
  timestamp: Date;
}

export interface RenderResult {
  success: boolean;
  previewId: string;
  html: string;
  errors: PreviewError[];
  renderTime: number;
}

const DEFAULT_CONFIG: PreviewConfig = {
  sandboxPermissions: ['allow-scripts', 'allow-same-origin'],
  defaultStyles: `
    * { box-sizing: border-box; }
    body { margin: 0; padding: 16px; font-family: system-ui, sans-serif; }
  `,
  refreshDebounceMs: 300,
  maxHeight: 600,
  enableConsoleCapture: true,
};

/**
 * Live Preview Renderer
 * Renders HTML/CSS/JS in a sandboxed preview environment
 */
export class LivePreviewRenderer {
  private config: PreviewConfig;
  private previews: Map<string, PreviewState> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: Partial<PreviewConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    logger.info('LivePreviewRenderer initialized', {
      sandboxPermissions: this.config.sandboxPermissions,
      refreshDebounceMs: this.config.refreshDebounceMs,
    });
  }

  /**
   * Create a new preview instance
   */
  createPreview(id?: string): PreviewState {
    const previewId = id || this.generateId();

    const preview: PreviewState = {
      id: previewId,
      html: '',
      css: '',
      js: '',
      lastUpdated: new Date(),
      errors: [],
      consoleOutput: [],
    };

    this.previews.set(previewId, preview);

    logger.info('Preview created', { previewId });
    return preview;
  }

  /**
   * Update preview content
   */
  updatePreview(
    previewId: string,
    content: { html?: string; css?: string; js?: string }
  ): PreviewState {
    const preview = this.previews.get(previewId);
    if (!preview) {
      throw new Error(`Preview not found: ${previewId}`);
    }

    if (content.html !== undefined) preview.html = content.html;
    if (content.css !== undefined) preview.css = content.css;
    if (content.js !== undefined) preview.js = content.js;
    preview.lastUpdated = new Date();
    preview.errors = [];

    logger.debug('Preview updated', { previewId });
    return preview;
  }

  /**
   * Render preview to full HTML document
   */
  render(previewId: string): RenderResult {
    const startTime = Date.now();
    const preview = this.previews.get(previewId);

    if (!preview) {
      return {
        success: false,
        previewId,
        html: '',
        errors: [
          {
            type: 'runtime',
            message: `Preview not found: ${previewId}`,
            timestamp: new Date(),
          },
        ],
        renderTime: Date.now() - startTime,
      };
    }

    const errors: PreviewError[] = [];

    // Validate HTML
    const htmlErrors = this.validateHtml(preview.html);
    errors.push(...htmlErrors);

    // Validate CSS
    const cssErrors = this.validateCss(preview.css);
    errors.push(...cssErrors);

    // Validate JS
    const jsErrors = this.validateJs(preview.js);
    errors.push(...jsErrors);

    // Generate full HTML document
    const fullHtml = this.generateDocument(preview);

    preview.errors = errors;

    const result: RenderResult = {
      success: errors.filter((e) => e.type !== 'runtime').length === 0,
      previewId,
      html: fullHtml,
      errors,
      renderTime: Date.now() - startTime,
    };

    logger.info('Preview rendered', {
      previewId,
      success: result.success,
      errorCount: errors.length,
      renderTime: result.renderTime,
    });

    return result;
  }

  /**
   * Render with debouncing (for real-time updates)
   */
  renderDebounced(previewId: string, callback: (result: RenderResult) => void): void {
    // Clear existing timer
    const existingTimer = this.debounceTimers.get(previewId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      const result = this.render(previewId);
      callback(result);
      this.debounceTimers.delete(previewId);
    }, this.config.refreshDebounceMs);

    this.debounceTimers.set(previewId, timer);
  }

  /**
   * Get preview by ID
   */
  getPreview(previewId: string): PreviewState | undefined {
    return this.previews.get(previewId);
  }

  /**
   * Delete preview
   */
  deletePreview(previewId: string): boolean {
    const deleted = this.previews.delete(previewId);
    if (deleted) {
      const timer = this.debounceTimers.get(previewId);
      if (timer) {
        clearTimeout(timer);
        this.debounceTimers.delete(previewId);
      }
      logger.info('Preview deleted', { previewId });
    }
    return deleted;
  }

  /**
   * Get all preview IDs
   */
  getAllPreviewIds(): string[] {
    return Array.from(this.previews.keys());
  }

  /**
   * Clear all previews
   */
  clearAll(): void {
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
    this.previews.clear();
    logger.info('All previews cleared');
  }

  /**
   * Get sandbox attribute string
   */
  getSandboxAttribute(): string {
    return this.config.sandboxPermissions.join(' ');
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PreviewConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('LivePreviewRenderer config updated');
  }

  /**
   * Get current configuration
   */
  getConfig(): PreviewConfig {
    return { ...this.config };
  }

  // Private methods

  private generateId(): string {
    return `preview_${Date.now().toString(16)}_${Math.random().toString(16).slice(2, 8)}`;
  }

  private generateDocument(preview: PreviewState): string {
    const consoleCapture = this.config.enableConsoleCapture
      ? `
      <script>
        (function() {
          const originalConsole = { ...console };
          ['log', 'warn', 'error', 'info'].forEach(level => {
            console[level] = function(...args) {
              originalConsole[level].apply(console, args);
              window.parent.postMessage({
                type: 'console',
                level: level,
                message: args.map(a => String(a)).join(' ')
              }, '*');
            };
          });
          window.onerror = function(msg, url, line, col, error) {
            window.parent.postMessage({
              type: 'error',
              message: msg,
              line: line,
              column: col
            }, '*');
          };
        })();
      </script>
    `
      : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    ${this.config.defaultStyles}
    ${preview.css}
  </style>
  ${consoleCapture}
</head>
<body>
  ${preview.html}
  <script>
    try {
      ${preview.js}
    } catch (e) {
      console.error('Script error:', e.message);
    }
  </script>
</body>
</html>`;
  }

  private validateHtml(html: string): PreviewError[] {
    const errors: PreviewError[] = [];

    // Check for unclosed tags (basic validation)
    const openTags = html.match(/<([a-z][a-z0-9]*)\b[^>]*(?!\/\s*)>/gi) || [];
    const closeTags = html.match(/<\/([a-z][a-z0-9]*)\s*>/gi) || [];

    // Self-closing tags to ignore
    const selfClosing = new Set([
      'area',
      'base',
      'br',
      'col',
      'embed',
      'hr',
      'img',
      'input',
      'link',
      'meta',
      'param',
      'source',
      'track',
      'wbr',
    ]);

    const openTagNames = openTags
      .map((t) => t.match(/<([a-z][a-z0-9]*)/i)?.[1]?.toLowerCase())
      .filter((t) => t && !selfClosing.has(t));

    const closeTagNames = closeTags.map((t) => t.match(/<\/([a-z][a-z0-9]*)/i)?.[1]?.toLowerCase());

    if (openTagNames.length !== closeTagNames.length) {
      errors.push({
        type: 'html',
        message: 'Possible unclosed HTML tags detected',
        timestamp: new Date(),
      });
    }

    return errors;
  }

  private validateCss(css: string): PreviewError[] {
    const errors: PreviewError[] = [];

    // Check for unbalanced braces
    const openBraces = (css.match(/{/g) || []).length;
    const closeBraces = (css.match(/}/g) || []).length;

    if (openBraces !== closeBraces) {
      errors.push({
        type: 'css',
        message: `Unbalanced CSS braces: ${openBraces} opening, ${closeBraces} closing`,
        timestamp: new Date(),
      });
    }

    return errors;
  }

  private validateJs(js: string): PreviewError[] {
    const errors: PreviewError[] = [];

    // Check for unbalanced braces
    const openBraces = (js.match(/{/g) || []).length;
    const closeBraces = (js.match(/}/g) || []).length;

    if (openBraces !== closeBraces) {
      errors.push({
        type: 'js',
        message: `Unbalanced JavaScript braces: ${openBraces} opening, ${closeBraces} closing`,
        timestamp: new Date(),
      });
    }

    // Check for unbalanced parentheses
    const openParens = (js.match(/\(/g) || []).length;
    const closeParens = (js.match(/\)/g) || []).length;

    if (openParens !== closeParens) {
      errors.push({
        type: 'js',
        message: `Unbalanced JavaScript parentheses: ${openParens} opening, ${closeParens} closing`,
        timestamp: new Date(),
      });
    }

    return errors;
  }
}

// Singleton instance
export const livePreview = new LivePreviewRenderer();

/**
 * Quick render helper
 */
export function renderPreview(html: string, css = '', js = ''): RenderResult {
  const preview = livePreview.createPreview();
  livePreview.updatePreview(preview.id, { html, css, js });
  return livePreview.render(preview.id);
}
