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

// Agent Pool Manager (#204)
export { AgentPool, agentPool } from './agent-pool';
export type { AgentState, PoolConfig, PoolStats, TaskAssignment } from './agent-pool';

// Task Decomposition Engine (#205)
export { TaskDecompositionEngine, taskDecompositionEngine } from './task-decomposition';
export type {
  TaskNode,
  TaskEdge,
  TaskGraph,
  DecompositionResult,
  ExecutionPlan,
  ExecutionPhase,
} from './task-decomposition';

// Conflict Resolution System (#206)
export { ConflictResolver, conflictResolver } from './conflict-resolution';
export type {
  Conflict,
  ChangeInfo,
  Resolution,
  MergeResult,
  ConflictAuditEntry,
} from './conflict-resolution';

// Code Complexity Analyzer (#212)
export { CodeComplexityAnalyzer, codeComplexityAnalyzer } from './code-complexity';
export type {
  ComplexityMetrics,
  HalsteadMetrics,
  CouplingAnalysis,
  CohesionMetrics,
  Hotspot,
  ComplexityTrend,
  AnalysisSummary,
} from './code-complexity';

// Auto-Fix PR Generator (#245)
export { AutoFixPRGenerator, autoFixPRGenerator } from './auto-fix-pr';
export type {
  FixCategory,
  PRPriority,
  AutoMergePolicy,
  FileChange,
  FixSuggestion,
  AutoFixPR,
  SecurityVulnerability,
  DependencyUpdate,
  AutoMergeConfig,
  PRStats,
  LintViolation,
} from './auto-fix-pr';

// Test Impact Analysis (#249)
export { TestImpactAnalyzer, testImpactAnalyzer } from './test-impact';
export type {
  TestPriority,
  ChangeType,
  TestFileMapping,
  CodeChange,
  ImpactAnalysis,
  AffectedTest,
  TestDependency,
  TestRecommendation,
  TestHistory,
} from './test-impact';

// Flaky Test Detection (#250)
export { FlakyTestDetector, flakyTestDetector } from './flaky-tests';
export type {
  FlakinessRootCause,
  FlakinessSeverity,
  QuarantineStatus,
  TestRunResult,
  FlakyTest,
  RootCauseAnalysis,
  QuarantineConfig,
  HealingStats,
} from './flaky-tests';

// Achievement & Badge System (#252)
export { AchievementSystem, achievementSystem } from './achievements';
export type {
  AchievementCategory,
  Rarity,
  Achievement,
  AchievementCriteria,
  UserProgress,
  Streak,
  Leaderboard,
  LeaderboardEntry,
  ShareCard,
} from './achievements';

// Green Code Sustainability Engine (#253)
export { GreenCodeEngine, greenCodeEngine } from './green-code';
export type {
  CarbonMetrics,
  ResourceUsage,
  GreenSuggestion,
  SustainabilityReport,
} from './green-code';

// Accessibility-First Development Agent (#254)
export { AccessibilityAgent, accessibilityAgent } from './accessibility';
export type { AccessibilityIssue, WCAGReport } from './accessibility';

// Autonomous Debugging Agent (#255)
export { AutonomousDebugger, autonomousDebugger } from './autonomous-debugging';
export type {
  DebugContext,
  RootCauseAnalysis as DebugRootCauseAnalysis,
  CodeFix,
  DebugResult,
} from './autonomous-debugging';

// Predictive Quality Intelligence (#256)
export { PredictiveQuality, predictiveQuality } from './predictive-quality';
export type { FileRisk, CommitAnalysis, ReleaseRisk } from './predictive-quality';

// Live Code Session Sharing (#261)
export { LiveSessionManager, liveSessionManager } from './live-session';
export type {
  SessionParticipant,
  CursorPosition,
  SelectionRange,
  CodeChange as SessionCodeChange,
  LiveSession,
  SessionConfig,
  SessionEvent,
} from './live-session';

// Team Knowledge Graph (#262)
export { KnowledgeGraphManager, knowledgeGraphManager } from './knowledge-graph';
export type {
  KnowledgeNode,
  KnowledgeEdge,
  TeamMember as GraphTeamMember,
  ExpertiseArea,
  Contribution,
  KnowledgeGraph,
  KnowledgeQuery,
  QueryResult,
} from './knowledge-graph';

// Multimodal Code Understanding (#255, #256)
export { MultimodalEngine, multimodalEngine } from './multimodal';
export type {
  ImageAnalysisResult,
  UIElement,
  GeneratedUICode,
  DiagramValidationResult,
  DiagramMatch,
  DriftIssue,
} from './multimodal';

// Multi-Model Orchestration Engine (#258)
export { OrchestrationEngine, orchestrationEngine } from './orchestration';
export type {
  ExecutionStep,
  OrchestrationExecutionPlan,
  StepResult,
  OrchestrationResult,
} from './orchestration';

// Technical Debt Forecasting (#243)
export { TechnicalDebtForecaster, technicalDebtForecaster } from './tech-debt';
export type {
  DebtItem,
  DebtType,
  DebtTrend,
  RemediationPlan,
  DebtForecast,
  DebtAnalysisResult,
} from './tech-debt';

// Intelligent Test Generation (#248)
export { TestGenerationEngine, testGenerationEngine } from './test-generation';
export type {
  TestCase,
  TestInput,
  Assertion,
  CoverageGap,
  GenerationResult,
  FunctionSignature,
} from './test-generation';

// Local Model Support (#259)
export { LocalModelManager, localModelManager } from './local-models';
export type {
  LocalModelConfig,
  LocalModelResponse,
  HealthCheckResult,
  LocalModelOptions,
} from './local-models';

// Debugging Memory & Pattern Database (#239)
export { DebugMemoryManager, debugMemoryManager } from './debug-memory';
export type { DebugPattern, DebugSession, DebugStep, PatternMatch } from './debug-memory';

// Team Leaderboards & Challenges (#253)
export { LeaderboardManager, leaderboardManager } from './leaderboards';
export type {
  LeaderboardEntry as TeamLeaderboardEntry,
  Leaderboard as TeamLeaderboard,
  LeaderboardCategory,
  Challenge,
  ChallengeParticipant,
  WeeklyStats,
} from './leaderboards';

// Bug Prediction Engine (#242)
export { BugPredictionEngine, bugPredictionEngine } from './bug-prediction';
export type {
  BugPrediction,
  BugType,
  RiskFactor,
  FileRiskScore,
  PredictionResult,
} from './bug-prediction';

// Self-Healing CI/CD Pipelines (#246)
export { SelfHealingCICD, selfHealingCICD } from './self-healing-cicd';
export type {
  PipelineRun,
  PipelineStage,
  HealingAttempt,
  PipelineIssue,
  IssueType,
  HealingAction,
  ActionType,
  HealingStrategy,
} from './self-healing-cicd';

// Screen Reader Simulation (#235)
export { ScreenReaderSimulator, screenReaderSimulator } from './screen-reader';
export type {
  ScreenReaderResult,
  ScreenReaderIssue,
  NavigationPath,
  NavigationStep,
  SimulationConfig,
} from './screen-reader';

// Green CI/CD Optimizer (#231)
export { GreenCICDOptimizer, greenCICDOptimizer } from './green-cicd';
export type {
  CarbonMetrics as GreenCarbonMetrics,
  OptimizationSuggestion,
  SuggestionType,
  PipelineAnalysis,
  ScheduleRecommendation,
} from './green-cicd';
