/**
 * Template Marketplace Service
 * Issue #124: Template Marketplace
 *
 * Marketplace for sharing and discovering templates
 */

import logger from '../utils/logger';

export interface MarketplaceTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
  version: string;
  downloads: number;
  rating: number;
  ratingCount: number;
  price: number;
  isFree: boolean;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateReview {
  id: string;
  templateId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

/**
 * Template Marketplace Manager
 */
export class TemplateMarketplace {
  private templates: Map<string, MarketplaceTemplate> = new Map();
  private reviews: TemplateReview[] = [];
  private userDownloads: Map<string, Set<string>> = new Map();

  constructor() {
    logger.info('TemplateMarketplace initialized');
  }

  /**
   * Publish template
   */
  publishTemplate(
    template: Omit<
      MarketplaceTemplate,
      'id' | 'downloads' | 'rating' | 'ratingCount' | 'createdAt' | 'updatedAt'
    >
  ): MarketplaceTemplate {
    const id = `mkt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const fullTemplate: MarketplaceTemplate = {
      id,
      ...template,
      downloads: 0,
      rating: 0,
      ratingCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.templates.set(id, fullTemplate);
    logger.info('Template published', { id, name: template.name });

    return fullTemplate;
  }

  /**
   * Get template
   */
  getTemplate(id: string): MarketplaceTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * List templates
   */
  listTemplates(
    options: {
      category?: string;
      freeOnly?: boolean;
      sortBy?: 'downloads' | 'rating' | 'newest';
    } = {}
  ): MarketplaceTemplate[] {
    let templates = Array.from(this.templates.values());

    if (options.category) {
      templates = templates.filter((t) => t.category === options.category);
    }

    if (options.freeOnly) {
      templates = templates.filter((t) => t.isFree);
    }

    if (options.sortBy === 'downloads') {
      templates.sort((a, b) => b.downloads - a.downloads);
    } else if (options.sortBy === 'rating') {
      templates.sort((a, b) => b.rating - a.rating);
    } else {
      templates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return templates;
  }

  /**
   * Download template
   */
  downloadTemplate(templateId: string, userId: string): string | null {
    const template = this.templates.get(templateId);
    if (!template) return null;

    template.downloads++;

    // Track user downloads
    if (!this.userDownloads.has(userId)) {
      this.userDownloads.set(userId, new Set());
    }
    this.userDownloads.get(userId)!.add(templateId);

    return template.content;
  }

  /**
   * Add review
   */
  addReview(
    templateId: string,
    userId: string,
    rating: number,
    comment: string
  ): TemplateReview | null {
    const template = this.templates.get(templateId);
    if (!template) return null;

    const review: TemplateReview = {
      id: `review_${Date.now()}`,
      templateId,
      userId,
      rating,
      comment,
      createdAt: new Date(),
    };

    this.reviews.push(review);

    // Update template rating
    const templateReviews = this.reviews.filter((r) => r.templateId === templateId);
    template.ratingCount = templateReviews.length;
    template.rating =
      templateReviews.reduce((sum, r) => sum + r.rating, 0) / templateReviews.length;

    return review;
  }

  /**
   * Get reviews
   */
  getReviews(templateId: string): TemplateReview[] {
    return this.reviews.filter((r) => r.templateId === templateId);
  }

  /**
   * Search templates
   */
  searchTemplates(query: string): MarketplaceTemplate[] {
    const lower = query.toLowerCase();
    return Array.from(this.templates.values()).filter(
      (t) =>
        t.name.toLowerCase().includes(lower) ||
        t.description.toLowerCase().includes(lower) ||
        t.tags.some((tag) => tag.toLowerCase().includes(lower))
    );
  }

  /**
   * Get user downloads
   */
  getUserDownloads(userId: string): MarketplaceTemplate[] {
    const downloadSet = this.userDownloads.get(userId);
    if (!downloadSet) return [];

    return Array.from(downloadSet)
      .map((id) => this.templates.get(id))
      .filter((t): t is MarketplaceTemplate => t !== undefined);
  }

  /**
   * Reset
   */
  reset(): void {
    this.templates.clear();
    this.reviews = [];
    this.userDownloads.clear();
    logger.info('TemplateMarketplace reset');
  }
}

export const templateMarketplace = new TemplateMarketplace();
