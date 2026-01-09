import { LiveDebugAssistant } from '../../../src/advanced/live-debug';

describe('LiveDebugAssistant', () => {
  let assistant: LiveDebugAssistant;

  beforeEach(() => {
    assistant = new LiveDebugAssistant();
  });

  describe('startSession', () => {
    it('should start a debug session', () => {
      const session = assistant.startSession({
        file: 'test.ts',
        line: 10,
        code: 'const x = obj.value;',
        variables: { obj: null },
        breakpoints: [10],
      });

      expect(session.id).toBeDefined();
      expect(session.isActive).toBe(true);
      expect(session.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('updateContext', () => {
    it('should update context and regenerate suggestions', () => {
      const session = assistant.startSession({
        file: 'test.ts',
        line: 10,
        code: 'foo()',
        variables: {},
        breakpoints: [],
      });

      const suggestions = assistant.updateContext(session.id, {
        stackTrace: 'TypeError: Cannot read property',
      });

      expect(suggestions.some((s) => s.type === 'fix')).toBe(true);
    });
  });

  describe('addWatch', () => {
    it('should add watch expression', () => {
      const session = assistant.startSession({
        file: 'test.ts',
        line: 1,
        code: '',
        variables: { x: 42 },
        breakpoints: [],
      });

      const watch = assistant.addWatch(session.id, 'x');
      expect(watch.value).toBe(42);
    });
  });

  describe('endSession', () => {
    it('should end session', () => {
      const session = assistant.startSession({
        file: 'test.ts',
        line: 1,
        code: '',
        variables: {},
        breakpoints: [],
      });

      assistant.endSession(session.id);
      const active = assistant.getActiveSession();
      expect(active).toBeNull();
    });
  });
});
