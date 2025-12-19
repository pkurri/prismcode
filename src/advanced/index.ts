/**
 * Advanced Module - Main exports
 * Phase 4: Advanced Features
 */

// Analytics (#117, #119, #128, #129, #130)
export { AnalyticsDashboard } from './analytics';
export type { AnalyticsMetrics, TimeSeriesData, AgentMetrics } from './analytics';

// Integrations (#125, #126, #127)
export {
  SlackIntegration,
  DiscordIntegration,
  EmailIntegration,
  NotificationService,
} from './integrations';
export type { NotificationPayload, IntegrationConfig } from './integrations';

// Team Features (#120, #121)
export { TeamService, AuditLogger } from './team';
export type { Team, TeamMember, TeamSettings, AuditLogEntry } from './team';

// Experiments (#131, #132)
export { FeatureFlagService, ABTestingService } from './experiments';
export type { FeatureFlag, Experiment, ExperimentVariant, ExperimentResult } from './experiments';
