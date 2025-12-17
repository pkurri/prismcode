/**
 * GitHub Module - Main exports
 */

export { GitHubService, type GitHubServiceConfig } from './service';
export {
  GitHubRestClient,
  type GitHubConfig,
  type Issue,
  type PullRequest,
  type Label,
  type Milestone,
  type Release,
  type Repository,
  type Branch,
} from './rest-client';
export { GitHubGraphQLClient, type GraphQLConfig, type ProjectV2, type ProjectItem } from './graphql-client';
