/**
 * Integration Connector Framework
 * GitHub Issue #312: [BACKEND] Integration Connector Framework
 */

export interface Connector {
  id: string;
  name: string;
  type: ConnectorType;
  status: 'connected' | 'disconnected' | 'error';
  config: Record<string, unknown>;
  lastSyncAt?: Date;
}

export type ConnectorType = 'github' | 'gitlab' | 'jira' | 'slack' | 'discord' | 'linear' | 'notion';

export interface ConnectorEvent {
  id: string;
  connectorId: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: Date;
}

// Connector registry
const connectors = new Map<string, Connector>();

export function registerConnector(connector: Connector): void {
  connectors.set(connector.id, connector);
}

export function getConnector(id: string): Connector | undefined {
  return connectors.get(id);
}

export function getAllConnectors(): Connector[] {
  return Array.from(connectors.values());
}

export async function syncConnector(connectorId: string): Promise<boolean> {
  const connector = connectors.get(connectorId);
  if (!connector) return false;
  
  // Simulate sync
  await new Promise(r => setTimeout(r, 100));
  connector.lastSyncAt = new Date();
  connector.status = 'connected';
  
  return true;
}

export async function handleWebhook(connectorId: string, event: ConnectorEvent): Promise<void> {
  console.log(`Webhook received for ${connectorId}:`, event.type);
  // Process based on event type
}

// Default connectors
registerConnector({ id: 'github-1', name: 'GitHub', type: 'github', status: 'connected', config: {} });
registerConnector({ id: 'slack-1', name: 'Slack', type: 'slack', status: 'disconnected', config: {} });
