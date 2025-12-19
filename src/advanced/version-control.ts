/**
 * Version Control Integration Service
 * Issue #139: Version Control Integration
 *
 * Git operations and repository management
 */

import logger from '../utils/logger';

export interface Repository {
  id: string;
  name: string;
  url: string;
  branch: string;
  lastSync: Date | null;
  status: 'connected' | 'disconnected' | 'error';
}

export interface Commit {
  sha: string;
  message: string;
  author: string;
  date: Date;
  files: string[];
}

export interface Branch {
  name: string;
  isDefault: boolean;
  lastCommit: string;
  protected: boolean;
}

export interface DiffResult {
  file: string;
  additions: number;
  deletions: number;
  changes: string[];
}

/**
 * Version Control Manager
 * Handles Git operations and repository management
 */
export class VersionControlManager {
  private repositories: Map<string, Repository> = new Map();
  private commits: Map<string, Commit[]> = new Map();
  private branches: Map<string, Branch[]> = new Map();

  constructor() {
    logger.info('VersionControlManager initialized');
  }

  /**
   * Add repository
   */
  addRepository(name: string, url: string, branch: string = 'main'): Repository {
    const id = `repo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const repo: Repository = {
      id,
      name,
      url,
      branch,
      lastSync: null,
      status: 'connected',
    };

    this.repositories.set(id, repo);
    this.commits.set(id, []);
    this.branches.set(id, [{ name: branch, isDefault: true, lastCommit: '', protected: true }]);

    logger.info('Repository added', { id, name });
    return repo;
  }

  /**
   * Get repository
   */
  getRepository(id: string): Repository | undefined {
    return this.repositories.get(id);
  }

  /**
   * List repositories
   */
  listRepositories(): Repository[] {
    return Array.from(this.repositories.values());
  }

  /**
   * Record commit
   */
  recordCommit(repoId: string, commit: Omit<Commit, 'sha'>): Commit | null {
    const commits = this.commits.get(repoId);
    if (!commits) return null;

    const fullCommit: Commit = {
      ...commit,
      sha: Math.random().toString(36).substr(2, 40),
    };

    commits.push(fullCommit);
    logger.info('Commit recorded', { repoId, sha: fullCommit.sha });

    return fullCommit;
  }

  /**
   * Get commits
   */
  getCommits(repoId: string, limit: number = 10): Commit[] {
    const commits = this.commits.get(repoId) || [];
    return commits.slice(-limit).reverse();
  }

  /**
   * Add branch
   */
  addBranch(repoId: string, name: string): Branch | null {
    const branches = this.branches.get(repoId);
    if (!branches) return null;

    const branch: Branch = {
      name,
      isDefault: false,
      lastCommit: '',
      protected: false,
    };

    branches.push(branch);
    return branch;
  }

  /**
   * Get branches
   */
  getBranches(repoId: string): Branch[] {
    return this.branches.get(repoId) || [];
  }

  /**
   * Sync repository (mock)
   */
  syncRepository(id: string): boolean {
    const repo = this.repositories.get(id);
    if (!repo) return false;

    repo.lastSync = new Date();
    repo.status = 'connected';
    logger.info('Repository synced', { id });

    return true;
  }

  /**
   * Get diff (mock)
   */
  getDiff(_repoId: string, _fromSha: string, _toSha: string): DiffResult[] {
    return [
      {
        file: 'src/index.ts',
        additions: 10,
        deletions: 5,
        changes: ['+added line', '-removed line'],
      },
    ];
  }

  /**
   * Remove repository
   */
  removeRepository(id: string): boolean {
    this.commits.delete(id);
    this.branches.delete(id);
    return this.repositories.delete(id);
  }

  /**
   * Reset
   */
  reset(): void {
    this.repositories.clear();
    this.commits.clear();
    this.branches.clear();
    logger.info('VersionControlManager reset');
  }
}

export const versionControlManager = new VersionControlManager();
