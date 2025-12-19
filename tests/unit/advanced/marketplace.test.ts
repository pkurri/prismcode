/**
 * Template Marketplace Tests
 * Tests for Issue #124
 */

import { TemplateMarketplace } from '../../../src/advanced/marketplace';

describe('TemplateMarketplace', () => {
  let marketplace: TemplateMarketplace;

  beforeEach(() => {
    marketplace = new TemplateMarketplace();
    marketplace.reset();
  });

  describe('publishTemplate', () => {
    it('should publish template', () => {
      const template = marketplace.publishTemplate({
        name: 'React Starter',
        description: 'React starter template',
        category: 'frontend',
        author: 'user1',
        version: '1.0.0',
        price: 0,
        isFree: true,
        content: '{}',
        tags: ['react', 'starter'],
      });

      expect(template.id).toBeDefined();
      expect(template.downloads).toBe(0);
    });
  });

  describe('listTemplates', () => {
    it('should list with sorting', () => {
      marketplace.publishTemplate({
        name: 'T1',
        description: '',
        category: 'c',
        author: 'a',
        version: '1',
        price: 0,
        isFree: true,
        content: '',
        tags: [],
      });
      marketplace.publishTemplate({
        name: 'T2',
        description: '',
        category: 'c',
        author: 'a',
        version: '1',
        price: 0,
        isFree: true,
        content: '',
        tags: [],
      });

      const templates = marketplace.listTemplates({ sortBy: 'newest' });
      expect(templates.length).toBe(2);
    });

    it('should filter free only', () => {
      marketplace.publishTemplate({
        name: 'Free',
        description: '',
        category: 'c',
        author: 'a',
        version: '1',
        price: 0,
        isFree: true,
        content: '',
        tags: [],
      });
      marketplace.publishTemplate({
        name: 'Paid',
        description: '',
        category: 'c',
        author: 'a',
        version: '1',
        price: 10,
        isFree: false,
        content: '',
        tags: [],
      });

      const free = marketplace.listTemplates({ freeOnly: true });
      expect(free.length).toBe(1);
    });
  });

  describe('downloadTemplate', () => {
    it('should download and track', () => {
      const template = marketplace.publishTemplate({
        name: 'T',
        description: '',
        category: 'c',
        author: 'a',
        version: '1',
        price: 0,
        isFree: true,
        content: 'content',
        tags: [],
      });

      const content = marketplace.downloadTemplate(template.id, 'user1');

      expect(content).toBe('content');
      expect(marketplace.getTemplate(template.id)!.downloads).toBe(1);
    });
  });

  describe('addReview', () => {
    it('should add review and update rating', () => {
      const template = marketplace.publishTemplate({
        name: 'T',
        description: '',
        category: 'c',
        author: 'a',
        version: '1',
        price: 0,
        isFree: true,
        content: '',
        tags: [],
      });

      marketplace.addReview(template.id, 'user1', 5, 'Great!');
      marketplace.addReview(template.id, 'user2', 4, 'Good');

      const updated = marketplace.getTemplate(template.id)!;
      expect(updated.rating).toBe(4.5);
      expect(updated.ratingCount).toBe(2);
    });
  });

  describe('getUserDownloads', () => {
    it('should get user downloads', () => {
      const t1 = marketplace.publishTemplate({
        name: 'T1',
        description: '',
        category: 'c',
        author: 'a',
        version: '1',
        price: 0,
        isFree: true,
        content: '',
        tags: [],
      });
      const t2 = marketplace.publishTemplate({
        name: 'T2',
        description: '',
        category: 'c',
        author: 'a',
        version: '1',
        price: 0,
        isFree: true,
        content: '',
        tags: [],
      });

      marketplace.downloadTemplate(t1.id, 'user1');
      marketplace.downloadTemplate(t2.id, 'user1');

      expect(marketplace.getUserDownloads('user1').length).toBe(2);
    });
  });
});
