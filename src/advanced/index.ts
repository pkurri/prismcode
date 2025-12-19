/**
 * Advanced Module - Main exports
 * Phase 4: Advanced Features
 */

// Analytics (#117, #119, #128, #129, #130)
export { AnalyticsDashboard, analyticsDashboard } from './analytics';
export type {
  AnalyticsMetrics,
  TimeSeriesData,
  AgentMetrics,
  DashboardSummary,
  EventLog,
} from './analytics';

// Usage Metrics (#128)
export { UsageMetricsService, usageMetrics } from './usage-metrics';
export type {
  APIUsageMetrics,
  FeatureUsageMetrics,
  UserSessionMetrics,
  UsageSummary,
} from './usage-metrics';

// Performance Monitoring (#129)
export { PerformanceMonitor, performanceMonitor } from './performance';
export type {
  PerformanceMetric,
  OperationTiming,
  SystemHealth,
  PerformanceAlert,
  PerformanceSummary,
} from './performance';

// Error Tracking (#130)
export { ErrorTracker, errorTracker } from './error-tracking';
export type { TrackedError, ErrorGroup, ErrorStats, ErrorTrend } from './error-tracking';

// Cost Tracking (#119)
export { CostTracker, costTracker } from './cost-tracking';
export type { APICallCost, CostBudget, CostSummary, CostTrend } from './cost-tracking';

// API Key Management (#134)
export { APIKeyManager, apiKeyManager } from './api-keys';
export type { APIKey, APIKeyCreateResult, APIKeyUsageStats } from './api-keys';

// Rate Limiting (#133)
export { RateLimitManager, rateLimitManager } from './rate-limit';
export type { RateLimitRule, RateLimitStatus, RateLimitStats } from './rate-limit';

// OAuth Integration (#135)
export { OAuthManager, oauthManager } from './oauth';
export type { OAuthProvider, OAuthToken, OAuthSession } from './oauth';

// Config Management (#137)
export { ConfigManager, configManager } from './config-manager';
export type { ConfigExport, ConfigImportResult } from './config-manager';

// Backup System (#138)
export { BackupManager, backupManager } from './backup';
export type { BackupMetadata, BackupSchedule, RestoreResult } from './backup';

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
