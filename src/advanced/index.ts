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

// SSO Support (#136)
export { SSOManager, ssoManager } from './sso';
export type { SSOProvider, SSOSession, SSOConfig } from './sso';

// Version Control (#139)
export { VersionControlManager, versionControlManager } from './version-control';
export type { Repository, Commit, Branch, DiffResult } from './version-control';

// Dependency Graph (#140)
export { DependencyGraphManager, dependencyGraphManager } from './dependency-graph';
export type {
  DependencyNode,
  DependencyEdge,
  DependencyGraph,
  DependencyAnalysis,
} from './dependency-graph';

// Multi-Repo Management (#118)
export { MultiRepoManager, multiRepoManager } from './multi-repo';
export type { ManagedRepo, RepoGroup, CrossRepoChange } from './multi-repo';

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

// Pattern Library (#123)
export { PatternLibrary, patternLibrary } from './pattern-library';
export type { CodePattern, PatternVariable, PatternCategory } from './pattern-library';

// Custom Agent (#122)
export { CustomAgentManager, customAgentManager } from './custom-agent';
export type { CustomAgent, AgentExecution } from './custom-agent';

// Workflow Templates (#116)
export { WorkflowTemplateManager, workflowTemplateManager } from './workflow-templates';
export type {
  WorkflowTemplate,
  WorkflowNode,
  WorkflowConnection,
  DeployedWorkflow,
} from './workflow-templates';

// Template Marketplace (#124)
export { TemplateMarketplace, templateMarketplace } from './marketplace';
export type { MarketplaceTemplate, TemplateReview } from './marketplace';

// Usage Analytics (#214)
export { UsageAnalytics, usageAnalytics } from './usage-analytics';
export type {
  UsageReport,
  UserUsage,
  ProjectUsage,
  ModelUsage,
  AgentUsage,
  UsageAlert,
  ExportConfig,
} from './usage-analytics';

// Smart Model Router (#215)
export { ModelRouter, modelRouter } from './model-router';
export type {
  ModelCapabilities,
  ModelCapability,
  TaskContext,
  RoutingDecision,
  RoutingPolicy,
} from './model-router';

// RBAC - Role Based Access Control (#218)
export { RBACManager, rbacManager } from './rbac';
export type { Permission, Role, UserRole, PermissionCheck, AuditEntry } from './rbac';

// Snyk Security Integration (#216)
export { SnykIntegration, snykIntegration } from './snyk-integration';
export type { SnykConfig, Vulnerability, ScanResult, FixSuggestion } from './snyk-integration';

// SonarQube Quality Gate (#217)
export { SonarQubeIntegration, sonarQubeIntegration } from './sonarqube-integration';
export type { SonarQubeConfig, QualityMetric, CodeSmell, QualityGateResult, PRAnalysisResult } from './sonarqube-integration';

// Linear Integration (#207)
export { LinearIntegration, linearIntegration } from './linear-integration';
export type { LinearConfig, LinearIssue, LinearState, LinearProject, SyncResult } from './linear-integration';

// Vercel Deployment Integration (#201)
export { VercelIntegration, vercelIntegration } from './vercel-integration';
export type { VercelConfig, VercelProject, VercelEnvVar, Deployment, DeploymentResult, FrameworkDetection } from './vercel-integration';

// Jira Cloud Integration (#208)
export { JiraIntegration, jiraIntegration } from './jira-integration';
export type { JiraConfig, JiraIssue, JiraStatus, JiraSprint, JiraProject } from './jira-integration';

// Compliance Audit Logging (#209)
export { ComplianceAuditLogger, complianceAuditLogger } from './audit-logging';
export type { AuditEvent, AuditAction, AuditContext, AuditQuery, AuditExport } from './audit-logging';

// PII Detection & Redaction (#210)
export { PIIDetector, piiDetector } from './pii-detection';
export type { PIIMatch, PIIType, ScanResult as PIIScanResult, PIIPolicy } from './pii-detection';

// Code Complexity Analyzer (#211)
export { CodeComplexityAnalyzer, codeComplexityAnalyzer } from './code-complexity';
export type { ComplexityMetrics, FileAnalysis, FunctionComplexity, ComplexityIssue, ProjectAnalysis } from './code-complexity';

// Agent Pool Manager (#202)
export { AgentPoolManager, agentPoolManager } from './agent-pool';
export type { AgentInstance, PoolConfig, TaskQueueItem, PoolStats } from './agent-pool';

// Task Decomposition Engine (#203)
export { TaskDecompositionEngine, taskDecompositionEngine } from './task-decomposition';
export type { Task, DecompositionResult, DependencyGraph as TaskDependencyGraph, MergeStrategy } from './task-decomposition';

// Conflict Resolution System (#204)
export { ConflictResolutionSystem, conflictResolutionSystem } from './conflict-resolution';
export type { FileChange as ConflictFileChange, Conflict, Resolution, MergeResult } from './conflict-resolution';

// Refactoring PR Generator (#212)
export { RefactoringPRGenerator, refactoringPRGenerator } from './refactoring-pr';
export type { RefactoringOpportunity, RefactoringType, RefactoringPR, RefactoringConfig } from './refactoring-pr';
