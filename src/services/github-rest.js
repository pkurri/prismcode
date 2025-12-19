"use strict";
/**
 * GitHub REST API Service
 * Provides wrapper around Octokit REST API with error handling and rate limiting
 *
 * Issue #67
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.githubRest = exports.GitHubRestService = void 0;
const rest_1 = require("@octokit/rest");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * GitHub REST API Service wrapper
 */
class GitHubRestService {
    constructor(config = {}) {
        this.octokit = new rest_1.Octokit({
            auth: config.token || process.env.GITHUB_TOKEN,
            retry: {
                enabled: true,
                retries: 3,
            },
            throttle: {
                onRateLimit: (retryAfter, options) => {
                    logger_1.default.warn(`Rate limit hit, retrying after ${retryAfter}s`, { options });
                    return true;
                },
                onSecondaryRateLimit: (retryAfter, options) => {
                    logger_1.default.warn(`Secondary rate limit hit, retrying after ${retryAfter}s`, { options });
                    return true;
                },
            },
        });
        this.owner = config.owner || process.env.GITHUB_OWNER || '';
        this.repo = config.repo || process.env.GITHUB_REPO || '';
        if (!this.owner || !this.repo) {
            logger_1.default.warn('GitHub owner or repo not configured');
        }
    }
    /**
     * Create a new issue
     */
    async createIssue(params) {
        try {
            logger_1.default.info('Creating GitHub issue', { title: params.title });
            const response = await this.octokit.issues.create({
                owner: this.owner,
                repo: this.repo,
                title: params.title,
                body: params.body,
                labels: params.labels,
                assignees: params.assignees,
                milestone: params.milestone,
            });
            logger_1.default.info('Issue created', { number: response.data.number });
            return response.data.number;
        }
        catch (error) {
            logger_1.default.error('Failed to create issue', { error, title: params.title });
            throw error;
        }
    }
    /**
     * Update an existing issue
     */
    async updateIssue(issueNumber, params) {
        try {
            logger_1.default.info('Updating GitHub issue', { issueNumber });
            await this.octokit.issues.update({
                owner: this.owner,
                repo: this.repo,
                issue_number: issueNumber,
                title: params.title,
                body: params.body,
                state: params.state,
                labels: params.labels,
                assignees: params.assignees,
                milestone: params.milestone,
            });
            logger_1.default.info('Issue updated', { issueNumber });
        }
        catch (error) {
            logger_1.default.error('Failed to update issue', { error, issueNumber });
            throw error;
        }
    }
    /**
     * Get issue details
     */
    async getIssue(issueNumber) {
        try {
            const response = await this.octokit.issues.get({
                owner: this.owner,
                repo: this.repo,
                issue_number: issueNumber,
            });
            return response.data;
        }
        catch (error) {
            logger_1.default.error('Failed to get issue', { error, issueNumber });
            throw error;
        }
    }
    /**
     * Close an issue
     */
    async closeIssue(issueNumber, comment) {
        try {
            logger_1.default.info('Closing issue', { issueNumber });
            if (comment) {
                await this.addComment(issueNumber, comment);
            }
            await this.octokit.issues.update({
                owner: this.owner,
                repo: this.repo,
                issue_number: issueNumber,
                state: 'closed',
            });
            logger_1.default.info('Issue closed', { issueNumber });
        }
        catch (error) {
            logger_1.default.error('Failed to close issue', { error, issueNumber });
            throw error;
        }
    }
    /**
     * Add a comment to an issue
     */
    async addComment(issueNumber, body) {
        try {
            await this.octokit.issues.createComment({
                owner: this.owner,
                repo: this.repo,
                issue_number: issueNumber,
                body,
            });
            logger_1.default.info('Comment added', { issueNumber });
        }
        catch (error) {
            logger_1.default.error('Failed to add comment', { error, issueNumber });
            throw error;
        }
    }
    /**
     * Add labels to an issue
     */
    async addLabels(issueNumber, labels) {
        try {
            await this.octokit.issues.addLabels({
                owner: this.owner,
                repo: this.repo,
                issue_number: issueNumber,
                labels,
            });
            logger_1.default.info('Labels added', { issueNumber, labels });
        }
        catch (error) {
            logger_1.default.error('Failed to add labels', { error, issueNumber });
            throw error;
        }
    }
    /**
     * Create a pull request
     */
    async createPullRequest(params) {
        try {
            logger_1.default.info('Creating pull request', { title: params.title });
            const response = await this.octokit.pulls.create({
                owner: this.owner,
                repo: this.repo,
                title: params.title,
                body: params.body,
                head: params.head,
                base: params.base,
            });
            logger_1.default.info('Pull request created', { number: response.data.number });
            return response.data.number;
        }
        catch (error) {
            logger_1.default.error('Failed to create pull request', { error });
            throw error;
        }
    }
    /**
     * Get repository information
     */
    async getRepository() {
        try {
            const response = await this.octokit.repos.get({
                owner: this.owner,
                repo: this.repo,
            });
            return response.data;
        }
        catch (error) {
            logger_1.default.error('Failed to get repository', { error });
            throw error;
        }
    }
    /**
     * List repository issues
     */
    async listIssues(params = {}) {
        try {
            const response = await this.octokit.issues.listForRepo({
                owner: this.owner,
                repo: this.repo,
                state: params.state || 'open',
                labels: params.labels,
                sort: params.sort || 'created',
                direction: params.direction || 'desc',
                per_page: params.per_page || 30,
            });
            return response.data;
        }
        catch (error) {
            logger_1.default.error('Failed to list issues', { error });
            throw error;
        }
    }
}
exports.GitHubRestService = GitHubRestService;
// Export singleton instance
exports.githubRest = new GitHubRestService();
//# sourceMappingURL=github-rest.js.map