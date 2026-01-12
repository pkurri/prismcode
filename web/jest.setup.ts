import '@testing-library/jest-dom';

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
}

// Only set window properties in browser environment
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });

  // Mock ResizeObserver
  class MockResizeObserver {
    observe = jest.fn();
    disconnect = jest.fn();
    unobserve = jest.fn();
  }

  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: MockResizeObserver,
  });

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Mock scrollIntoView
  Element.prototype.scrollIntoView = jest.fn();
}

// Polyfill Request for node environment (API route tests using plain Request)
if (typeof globalThis.Request === 'undefined') {
  // @ts-expect-error - Minimal polyfill for tests
  globalThis.Request = class Request {
    url: string;
    method: string;
    private _body: string | null;
    
    constructor(url: string | URL, init?: { method?: string; body?: string }) {
      this.url = typeof url === 'string' ? url : url.toString();
      this.method = init?.method || 'GET';
      this._body = init?.body || null;
    }

    async json() {
      return this._body ? JSON.parse(this._body) : {};
    }
  };
}
