/**
 * Carbon Footprint Analyzer
 * Issue #228: Carbon Footprint Analyzer - Core Engine
 *
 * Core engine for analyzing and tracking carbon footprint of code operations
 */

import logger from '../utils/logger';

export interface CarbonFootprint {
  totalGrams: number;
  breakdown: CarbonBreakdown;
  intensity: number;
  timestamp: Date;
}

export interface CarbonBreakdown {
  compute: number;
  memory: number;
  network: number;
  storage: number;
}

export interface ResourceUsage {
  cpuSeconds: number;
  memoryMB: number;
  networkMB: number;
  storageMB: number;
}

export interface CarbonReport {
  period: 'hour' | 'day' | 'week' | 'month';
  totalEmissions: number;
  trend: number[];
  topContributors: Contributor[];
  recommendations: Recommendation[];
}

export interface Contributor {
  source: string;
  emissions: number;
  percentage: number;
}

export interface Recommendation {
  action: string;
  impact: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

const CARBON_FACTORS = {
  cpuPerSecond: 0.0015, // gCO2 per CPU second
  memoryPerMB: 0.0003, // gCO2 per MB-hour
  networkPerMB: 0.0011, // gCO2 per MB transferred
  storagePerMB: 0.0001, // gCO2 per MB stored
};

/**
 * Carbon Footprint Analyzer
 * Tracks and analyzes carbon emissions from code operations
 */
export class CarbonFootprintAnalyzer {
  private history: CarbonFootprint[] = [];
  private gridIntensity: number = 400; // gCO2/kWh default

  constructor() {
    logger.info('CarbonFootprintAnalyzer initialized');
  }

  /**
   * Calculate carbon footprint from resource usage
   */
  calculate(usage: ResourceUsage): CarbonFootprint {
    const breakdown: CarbonBreakdown = {
      compute: usage.cpuSeconds * CARBON_FACTORS.cpuPerSecond * (this.gridIntensity / 400),
      memory: usage.memoryMB * CARBON_FACTORS.memoryPerMB,
      network: usage.networkMB * CARBON_FACTORS.networkPerMB,
      storage: usage.storageMB * CARBON_FACTORS.storagePerMB,
    };

    const totalGrams = breakdown.compute + breakdown.memory + breakdown.network + breakdown.storage;
    const footprint: CarbonFootprint = {
      totalGrams: Math.round(totalGrams * 1000) / 1000,
      breakdown,
      intensity: this.gridIntensity,
      timestamp: new Date(),
    };

    this.history.push(footprint);
    logger.debug('Carbon calculated', { total: footprint.totalGrams });

    return footprint;
  }

  /**
   * Set grid carbon intensity for region
   */
  setGridIntensity(gCO2PerKWh: number): void {
    this.gridIntensity = gCO2PerKWh;
    logger.info('Grid intensity set', { intensity: gCO2PerKWh });
  }

  /**
   * Generate carbon report
   */
  generateReport(period: CarbonReport['period']): CarbonReport {
    const cutoff = this.getCutoffDate(period);
    const periodData = this.history.filter((h) => h.timestamp >= cutoff);

    const totalEmissions = periodData.reduce((sum, h) => sum + h.totalGrams, 0);
    const trend = this.calculateTrend(periodData);
    const topContributors = this.getTopContributors(periodData);
    const recommendations = this.generateRecommendations(topContributors);

    return {
      period,
      totalEmissions: Math.round(totalEmissions * 100) / 100,
      trend,
      topContributors,
      recommendations,
    };
  }

  /**
   * Get historical data
   */
  getHistory(limit?: number): CarbonFootprint[] {
    if (limit) {
      return this.history.slice(-limit);
    }
    return [...this.history];
  }

  /**
   * Compare two footprints
   */
  compare(
    before: CarbonFootprint,
    after: CarbonFootprint
  ): {
    difference: number;
    percentChange: number;
    improved: boolean;
  } {
    const difference = after.totalGrams - before.totalGrams;
    const percentChange =
      before.totalGrams > 0 ? Math.round((difference / before.totalGrams) * 100) : 0;

    return {
      difference: Math.round(difference * 1000) / 1000,
      percentChange,
      improved: difference < 0,
    };
  }

  private getCutoffDate(period: CarbonReport['period']): Date {
    const now = new Date();
    switch (period) {
      case 'hour':
        return new Date(now.getTime() - 3600000);
      case 'day':
        return new Date(now.getTime() - 86400000);
      case 'week':
        return new Date(now.getTime() - 604800000);
      case 'month':
        return new Date(now.getTime() - 2592000000);
    }
  }

  private calculateTrend(data: CarbonFootprint[]): number[] {
    if (data.length === 0) return [];
    return data.map((d) => d.totalGrams);
  }

  private getTopContributors(data: CarbonFootprint[]): Contributor[] {
    const totals = { compute: 0, memory: 0, network: 0, storage: 0 };

    for (const d of data) {
      totals.compute += d.breakdown.compute;
      totals.memory += d.breakdown.memory;
      totals.network += d.breakdown.network;
      totals.storage += d.breakdown.storage;
    }

    const total = totals.compute + totals.memory + totals.network + totals.storage;
    if (total === 0) return [];

    return Object.entries(totals)
      .map(([source, emissions]) => ({
        source,
        emissions: Math.round(emissions * 100) / 100,
        percentage: Math.round((emissions / total) * 100),
      }))
      .sort((a, b) => b.emissions - a.emissions);
  }

  private generateRecommendations(contributors: Contributor[]): Recommendation[] {
    const recs: Recommendation[] = [];

    if (contributors.find((c) => c.source === 'compute' && c.percentage > 40)) {
      recs.push({
        action: 'Optimize CPU-intensive operations',
        impact: 30,
        difficulty: 'medium',
      });
    }

    if (contributors.find((c) => c.source === 'memory' && c.percentage > 25)) {
      recs.push({
        action: 'Reduce memory allocations',
        impact: 20,
        difficulty: 'medium',
      });
    }

    if (contributors.find((c) => c.source === 'network' && c.percentage > 20)) {
      recs.push({
        action: 'Minimize network requests and payload sizes',
        impact: 25,
        difficulty: 'easy',
      });
    }

    return recs;
  }
}

export const carbonFootprintAnalyzer = new CarbonFootprintAnalyzer();
