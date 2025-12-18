/**
 * Feature Flags & A/B Testing
 * Issues #131, #132: A/B Testing Framework & Feature Flags
 */

export interface FeatureFlag {
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetUsers?: string[];
  targetTeams?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Experiment {
  id: string;
  name: string;
  description?: string;
  variants: ExperimentVariant[];
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate?: Date;
  endDate?: Date;
  metrics: string[];
}

export interface ExperimentVariant {
  id: string;
  name: string;
  weight: number;
  config: Record<string, unknown>;
}

export interface ExperimentResult {
  experimentId: string;
  variantId: string;
  metric: string;
  value: number;
  sampleSize: number;
  confidence: number;
}

/**
 * Feature Flags Service (#132)
 */
export class FeatureFlagService {
  private flags: Map<string, FeatureFlag> = new Map();
  private userFlags: Map<string, Set<string>> = new Map();

  create(flag: Omit<FeatureFlag, 'createdAt' | 'updatedAt'>): FeatureFlag {
    const fullFlag: FeatureFlag = {
      ...flag,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.flags.set(flag.key, fullFlag);
    return fullFlag;
  }

  isEnabled(key: string, userId?: string): boolean {
    const flag = this.flags.get(key);
    if (!flag) return false;
    if (!flag.enabled) return false;

    // Check if user is in target list
    if (flag.targetUsers && userId) {
      if (flag.targetUsers.includes(userId)) return true;
    }

    // Rollout percentage
    if (flag.rolloutPercentage < 100) {
      if (!userId) return false;
      const hash = this.hashUser(userId, key);
      return hash < flag.rolloutPercentage;
    }

    return true;
  }

  toggle(key: string, enabled: boolean): void {
    const flag = this.flags.get(key);
    if (flag) {
      flag.enabled = enabled;
      flag.updatedAt = new Date();
    }
  }

  list(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  private hashUser(userId: string, flagKey: string): number {
    const str = `${userId}:${flagKey}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash % 100);
  }
}

/**
 * A/B Testing Service (#131)
 */
export class ABTestingService {
  private experiments: Map<string, Experiment> = new Map();
  private assignments: Map<string, Map<string, string>> = new Map();
  private results: ExperimentResult[] = [];

  createExperiment(experiment: Omit<Experiment, 'id'>): Experiment {
    const fullExperiment: Experiment = {
      ...experiment,
      id: this.generateId(),
    };

    this.experiments.set(fullExperiment.id, fullExperiment);
    return fullExperiment;
  }

  getVariant(experimentId: string, userId: string): ExperimentVariant | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'running') return null;

    // Check existing assignment
    const userAssignments = this.assignments.get(userId);
    if (userAssignments?.has(experimentId)) {
      const variantId = userAssignments.get(experimentId)!;
      return experiment.variants.find((v) => v.id === variantId) || null;
    }

    // Assign variant based on weights
    const variant = this.assignVariant(experiment, userId);

    // Store assignment
    if (!this.assignments.has(userId)) {
      this.assignments.set(userId, new Map());
    }
    this.assignments.get(userId)!.set(experimentId, variant.id);

    return variant;
  }

  recordMetric(experimentId: string, userId: string, metric: string, value: number): void {
    const userAssignments = this.assignments.get(userId);
    const variantId = userAssignments?.get(experimentId);

    if (!variantId) return;

    this.results.push({
      experimentId,
      variantId,
      metric,
      value,
      sampleSize: 1,
      confidence: 0,
    });
  }

  getResults(experimentId: string): ExperimentResult[] {
    return this.results.filter((r) => r.experimentId === experimentId);
  }

  private assignVariant(experiment: Experiment, userId: string): ExperimentVariant {
    const totalWeight = experiment.variants.reduce((sum, v) => sum + v.weight, 0);
    const hash = this.hashUser(userId, experiment.id);
    const target = (hash / 100) * totalWeight;

    let cumulative = 0;
    for (const variant of experiment.variants) {
      cumulative += variant.weight;
      if (target <= cumulative) return variant;
    }

    return experiment.variants[experiment.variants.length - 1];
  }

  private hashUser(userId: string, experimentId: string): number {
    const str = `${userId}:${experimentId}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash % 100);
  }

  private generateId(): string {
    return `exp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
}
