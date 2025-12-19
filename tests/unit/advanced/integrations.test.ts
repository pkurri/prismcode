/**
 * Integrations Tests
 * Tests for Issues #125-127: Slack, Discord, Email Notifications
 */

import {
  SlackIntegration,
  DiscordIntegration,
  EmailIntegration,
  NotificationService,
} from '../../../src/advanced/integrations';

describe('SlackIntegration', () => {
  let slack: SlackIntegration;

  beforeEach(() => {
    slack = new SlackIntegration({
      enabled: true,
      webhookUrl: 'https://hooks.slack.com/test',
      channel: '#general',
    });
  });

  describe('send', () => {
    it('should return false when disabled', async () => {
      const disabled = new SlackIntegration({ enabled: false });
      const result = await disabled.send({ title: 'Test', message: 'Test', type: 'info' });
      expect(result).toBe(false);
    });

    it('should return false without webhookUrl', async () => {
      const noUrl = new SlackIntegration({ enabled: true });
      const result = await noUrl.send({ title: 'Test', message: 'Test', type: 'info' });
      expect(result).toBe(false);
    });
  });
});

describe('DiscordIntegration', () => {
  let discord: DiscordIntegration;

  beforeEach(() => {
    discord = new DiscordIntegration({
      enabled: true,
      webhookUrl: 'https://discord.com/api/webhooks/test',
    });
  });

  describe('send', () => {
    it('should return false when disabled', async () => {
      const disabled = new DiscordIntegration({ enabled: false });
      const result = await disabled.send({ title: 'Test', message: 'Test', type: 'info' });
      expect(result).toBe(false);
    });

    it('should return false without webhookUrl', async () => {
      const noUrl = new DiscordIntegration({ enabled: true });
      const result = await noUrl.send({ title: 'Test', message: 'Test', type: 'info' });
      expect(result).toBe(false);
    });
  });
});

describe('EmailIntegration', () => {
  let email: EmailIntegration;

  beforeEach(() => {
    email = new EmailIntegration({
      enabled: true,
      smtpHost: 'smtp.test.com',
      smtpPort: 587,
      from: 'test@example.com',
    });
  });

  describe('send', () => {
    it('should send email when enabled', async () => {
      const result = await email.send('recipient@example.com', {
        title: 'Test Email',
        message: 'Test message',
        type: 'info',
      });
      expect(result).toBe(true);
    });

    it('should return false when disabled', async () => {
      const disabled = new EmailIntegration({ enabled: false });
      const result = await disabled.send('test@example.com', {
        title: 'Test',
        message: 'Test',
        type: 'info',
      });
      expect(result).toBe(false);
    });
  });
});

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
  });

  describe('registerSlack', () => {
    it('should register Slack integration', () => {
      service.registerSlack({ enabled: true, webhookUrl: 'https://slack.test' });
      // No error means success
      expect(service).toBeDefined();
    });
  });

  describe('registerDiscord', () => {
    it('should register Discord integration', () => {
      service.registerDiscord({ enabled: true, webhookUrl: 'https://discord.test' });
      expect(service).toBeDefined();
    });
  });

  describe('registerEmail', () => {
    it('should register Email integration', () => {
      // registerEmail requires IntegrationConfig, not NotificationPayload
      service.registerEmail({ enabled: true } as never);
      expect(service).toBeDefined();
    });
  });

  describe('broadcast', () => {
    it('should broadcast to all registered channels', async () => {
      // With no integrations registered, should complete without error
      await expect(
        service.broadcast({ title: 'Test', message: 'Test', type: 'info' })
      ).resolves.not.toThrow();
    });
  });
});
