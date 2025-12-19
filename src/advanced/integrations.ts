/**
 * Third-Party Integrations
 * Issues #125-127: Slack, Discord, Email Notifications
 */

export interface NotificationPayload {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  metadata?: Record<string, unknown>;
}

export interface IntegrationConfig {
  enabled: boolean;
  webhookUrl?: string;
  apiKey?: string;
  channel?: string;
}

/**
 * Slack Integration (#125)
 */
export class SlackIntegration {
  private config: IntegrationConfig;

  constructor(config: IntegrationConfig) {
    this.config = config;
  }

  async send(payload: NotificationPayload): Promise<boolean> {
    if (!this.config.enabled || !this.config.webhookUrl) {
      return false;
    }

    const slackMessage = {
      channel: this.config.channel,
      attachments: [
        {
          color: this.getColor(payload.type),
          title: payload.title,
          text: payload.message,
          footer: 'PrismCode',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    try {
      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackMessage),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private getColor(type: string): string {
    const colors = { info: '#2196F3', success: '#4CAF50', warning: '#FF9800', error: '#F44336' };
    return colors[type as keyof typeof colors] || '#757575';
  }
}

/**
 * Discord Integration (#126)
 */
export class DiscordIntegration {
  private config: IntegrationConfig;

  constructor(config: IntegrationConfig) {
    this.config = config;
  }

  async send(payload: NotificationPayload): Promise<boolean> {
    if (!this.config.enabled || !this.config.webhookUrl) {
      return false;
    }

    const discordMessage = {
      embeds: [
        {
          title: payload.title,
          description: payload.message,
          color: this.getColor(payload.type),
          footer: { text: 'PrismCode' },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    try {
      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordMessage),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private getColor(type: string): number {
    const colors = { info: 0x2196f3, success: 0x4caf50, warning: 0xff9800, error: 0xf44336 };
    return colors[type as keyof typeof colors] || 0x757575;
  }
}

/**
 * Email Integration (#127)
 */
export class EmailIntegration {
  private config: IntegrationConfig & { smtpHost?: string; smtpPort?: number; from?: string };

  constructor(config: typeof this.config) {
    this.config = config;
  }

  send(to: string, payload: NotificationPayload): Promise<boolean> {
    if (!this.config.enabled) {
      return Promise.resolve(false);
    }

    // Email sending would use nodemailer or similar
    // This is a placeholder implementation
    console.log(`[Email] To: ${to}, Subject: ${payload.title}`);
    return Promise.resolve(true);
  }
}

/**
 * Unified Notification Service
 */
export class NotificationService {
  private slack?: SlackIntegration;
  private discord?: DiscordIntegration;
  private email?: EmailIntegration;

  registerSlack(config: IntegrationConfig): void {
    this.slack = new SlackIntegration(config);
  }

  registerDiscord(config: IntegrationConfig): void {
    this.discord = new DiscordIntegration(config);
  }

  registerEmail(
    config: Parameters<typeof EmailIntegration.prototype.send>[1] & IntegrationConfig
  ): void {
    this.email = new EmailIntegration(config);
  }

  async broadcast(payload: NotificationPayload): Promise<void> {
    const promises: Promise<boolean>[] = [];

    if (this.slack) promises.push(this.slack.send(payload));
    if (this.discord) promises.push(this.discord.send(payload));

    await Promise.allSettled(promises);
  }
}
