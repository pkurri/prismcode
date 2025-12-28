import {
  CheckpointManager,
  CheckpointMetadata,
  CheckpointDiff,
  RollbackResult,
  createFileSnapshot,
} from '../../../src/advanced/checkpoints';

describe('Progress Checkpoints & Rollback', () => {
  let manager: CheckpointManager;

  beforeEach(() => {
    manager = new CheckpointManager({ maxCheckpoints: 10 });
  });

  describe('Checkpoint Creation', () => {
    it('should create a checkpoint with basic info', async () => {
      const checkpoint = manager.createCheckpoint('Initial state');

      expect(checkpoint.id).toBeDefined();
      expect(checkpoint.name).toBe('Initial state');
      expect(checkpoint.createdAt).toBeInstanceOf(Date);
      expect(checkpoint.files).toHaveLength(0);
    });

    it('should create a checkpoint with files', async () => {
      const files = [
        createFileSnapshot('src/index.ts', 'console.log("hello")'),
        createFileSnapshot('src/utils.ts', 'export const add = (a, b) => a + b'),
      ];

      const checkpoint = manager.createCheckpoint('With files', {
        files,
        description: 'Test checkpoint',
      });

      expect(checkpoint.files).toHaveLength(2);
      expect(checkpoint.description).toBe('Test checkpoint');
    });

    it('should create a checkpoint with custom state', async () => {
      const checkpoint = manager.createCheckpoint('With state', {
        state: { step: 1, progress: 0.5 },
      });

      expect(checkpoint.state.step).toBe(1);
      expect(checkpoint.state.progress).toBe(0.5);
    });

    it('should auto-commit when files are present', async () => {
      const files = [createFileSnapshot('test.txt', 'content')];
      const checkpoint = manager.createCheckpoint('Auto commit test', { files });

      expect(checkpoint.gitCommit).toBeDefined();
    });

    it('should associate checkpoint with current task', async () => {
      manager.setCurrentTask('task-123');
      const checkpoint = manager.createCheckpoint('Task checkpoint');

      expect(checkpoint.taskId).toBe('task-123');
    });
  });

  describe('Checkpoint Retrieval', () => {
    it('should retrieve a checkpoint by ID', async () => {
      const created = manager.createCheckpoint('Test');
      const retrieved = manager.getCheckpoint(created.id);

      expect(retrieved?.id).toBe(created.id);
    });

    it('should return undefined for non-existent ID', () => {
      const checkpoint = manager.getCheckpoint('non-existent-id');
      expect(checkpoint).toBeUndefined();
    });

    it('should get all checkpoints sorted by date', async () => {
      manager.createCheckpoint('First');
      await new Promise((r) => setTimeout(r, 10));
      manager.createCheckpoint('Second');
      await new Promise((r) => setTimeout(r, 10));
      manager.createCheckpoint('Third');

      const checkpoints = manager.getAllCheckpoints();

      expect(checkpoints).toHaveLength(3);
      expect(checkpoints[0].name).toBe('Third');
      expect(checkpoints[2].name).toBe('First');
    });

    it('should get checkpoints for a specific task', async () => {
      manager.setCurrentTask('task-a');
      manager.createCheckpoint('Task A - 1');
      manager.createCheckpoint('Task A - 2');

      manager.setCurrentTask('task-b');
      manager.createCheckpoint('Task B - 1');

      const taskACheckpoints = manager.getTaskCheckpoints('task-a');
      expect(taskACheckpoints).toHaveLength(2);
    });

    it('should get the latest checkpoint', async () => {
      manager.createCheckpoint('First');
      await new Promise((r) => setTimeout(r, 10));
      manager.createCheckpoint('Latest');

      const latest = manager.getLatestCheckpoint();
      expect(latest?.name).toBe('Latest');
    });
  });

  describe('Checkpoint Diff', () => {
    it('should calculate diff between checkpoints', async () => {
      const cp1 = manager.createCheckpoint('V1', {
        files: [
          createFileSnapshot('file1.ts', 'original'),
          createFileSnapshot('file2.ts', 'unchanged'),
        ],
      });

      const cp2 = manager.createCheckpoint('V2', {
        files: [
          createFileSnapshot('file1.ts', 'modified'),
          createFileSnapshot('file2.ts', 'unchanged'),
          createFileSnapshot('file3.ts', 'new file'),
        ],
      });

      const diff = manager.diffCheckpoints(cp1.id, cp2.id);

      expect(diff.fromCheckpoint).toBe(cp1.id);
      expect(diff.toCheckpoint).toBe(cp2.id);
      expect(diff.changes).toHaveLength(2); // 1 modified, 1 added
    });

    it('should detect added files', async () => {
      const cp1 = manager.createCheckpoint('Before', { files: [] });
      const cp2 = manager.createCheckpoint('After', {
        files: [createFileSnapshot('new.ts', 'content')],
      });

      const diff = manager.diffCheckpoints(cp1.id, cp2.id);
      const addedFile = diff.changes.find((c) => c.type === 'added');

      expect(addedFile).toBeDefined();
      expect(addedFile?.path).toBe('new.ts');
    });

    it('should detect deleted files', async () => {
      const cp1 = manager.createCheckpoint('Before', {
        files: [createFileSnapshot('removed.ts', 'content')],
      });
      const cp2 = manager.createCheckpoint('After', { files: [] });

      const diff = manager.diffCheckpoints(cp1.id, cp2.id);
      const deletedFile = diff.changes.find((c) => c.type === 'deleted');

      expect(deletedFile).toBeDefined();
      expect(deletedFile?.path).toBe('removed.ts');
    });

    it('should detect modified files', async () => {
      const cp1 = manager.createCheckpoint('Before', {
        files: [createFileSnapshot('file.ts', 'old content')],
      });
      const cp2 = manager.createCheckpoint('After', {
        files: [createFileSnapshot('file.ts', 'new content')],
      });

      const diff = manager.diffCheckpoints(cp1.id, cp2.id);
      const modifiedFile = diff.changes.find((c) => c.type === 'modified');

      expect(modifiedFile).toBeDefined();
      expect(modifiedFile?.oldContent).toBe('old content');
      expect(modifiedFile?.newContent).toBe('new content');
    });

    it('should throw for non-existent checkpoints', async () => {
      const cp1 = manager.createCheckpoint('Valid');

      expect(() => manager.diffCheckpoints(cp1.id, 'invalid-id')).toThrow();
    });
  });

  describe('Rollback', () => {
    it('should rollback to a checkpoint', async () => {
      const cp = manager.createCheckpoint('Target', {
        files: [createFileSnapshot('file.ts', 'content')],
      });

      const result = manager.rollback(cp.id);

      expect(result.success).toBe(true);
      expect(result.checkpointId).toBe(cp.id);
      expect(result.restoredFiles).toContain('file.ts');
    });

    it('should remove checkpoints after rollback target', async () => {
      const cp1 = manager.createCheckpoint('Keep');
      await new Promise((r) => setTimeout(r, 10));
      manager.createCheckpoint('Remove 1');
      manager.createCheckpoint('Remove 2');

      manager.rollback(cp1.id);

      expect(manager.getCount()).toBe(1);
    });

    it('should fail for non-existent checkpoint', async () => {
      const result = manager.rollback('invalid-id');

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should rollback to previous checkpoint', async () => {
      manager.createCheckpoint('Current');
      await new Promise((r) => setTimeout(r, 10));
      const target = manager.createCheckpoint('Previous');
      await new Promise((r) => setTimeout(r, 10));
      manager.createCheckpoint('Latest');

      const result = manager.rollbackToPrevious();

      expect(result.success).toBe(true);
      expect(result.checkpointId).toBe(target.id);
    });

    it('should fail rollback to previous when only one checkpoint', async () => {
      manager.createCheckpoint('Only one');

      const result = manager.rollbackToPrevious();

      expect(result.success).toBe(false);
    });
  });

  describe('Checkpoint Management', () => {
    it('should delete a checkpoint', async () => {
      const cp = manager.createCheckpoint('To delete');
      const deleted = manager.deleteCheckpoint(cp.id);

      expect(deleted).toBe(true);
      expect(manager.getCheckpoint(cp.id)).toBeUndefined();
    });

    it('should return false when deleting non-existent checkpoint', () => {
      const deleted = manager.deleteCheckpoint('invalid-id');
      expect(deleted).toBe(false);
    });

    it('should clear all checkpoints', async () => {
      manager.createCheckpoint('One');
      manager.createCheckpoint('Two');
      manager.clearAll();

      expect(manager.getCount()).toBe(0);
    });

    it('should cleanup old checkpoints when exceeding max', async () => {
      const smallManager = new CheckpointManager({ maxCheckpoints: 3 });

      await smallManager.createCheckpoint('1');
      await smallManager.createCheckpoint('2');
      await smallManager.createCheckpoint('3');
      await smallManager.createCheckpoint('4');
      await smallManager.createCheckpoint('5');

      expect(smallManager.getCount()).toBe(3);
    });
  });

  describe('Configuration', () => {
    it('should update configuration', () => {
      manager.updateConfig({ maxCheckpoints: 20, autoCommit: false });
      const config = manager.getConfig();

      expect(config.maxCheckpoints).toBe(20);
      expect(config.autoCommit).toBe(false);
    });

    it('should set and get current task', () => {
      manager.setCurrentTask('my-task');
      expect(manager.getCurrentTask()).toBe('my-task');

      manager.setCurrentTask(undefined);
      expect(manager.getCurrentTask()).toBeUndefined();
    });
  });

  describe('File Snapshot Helper', () => {
    it('should create file snapshots with hash', () => {
      const snapshot = createFileSnapshot('test.ts', 'content');

      expect(snapshot.path).toBe('test.ts');
      expect(snapshot.content).toBe('content');
      expect(snapshot.hash).toBeDefined();
    });

    it('should generate different hashes for different content', () => {
      const snap1 = createFileSnapshot('file.ts', 'content A');
      const snap2 = createFileSnapshot('file.ts', 'content B');

      expect(snap1.hash).not.toBe(snap2.hash);
    });

    it('should generate same hash for same content', () => {
      const snap1 = createFileSnapshot('file1.ts', 'identical');
      const snap2 = createFileSnapshot('file2.ts', 'identical');

      expect(snap1.hash).toBe(snap2.hash);
    });
  });
});
