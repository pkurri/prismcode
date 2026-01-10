'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Environment {
  id: string;
  name: string;
  type: 'local' | 'cloud' | 'staging' | 'custom';
  url: string;
  status: 'idle' | 'building' | 'running' | 'failed' | 'provisioning';
  lastDeploy?: string;
  branch?: string;
  uptime?: string;
  healthCheck?: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    latency: number;
    lastCheck: string;
  };
}

const mockEnvironments: Environment[] = [
  {
    id: 'local',
    name: 'Local Dev',
    type: 'local',
    url: 'http://localhost:3000',
    status: 'running',
    branch: 'feature/auth-flow',
    uptime: '2h 34m',
    healthCheck: { status: 'healthy', latency: 5, lastCheck: 'Just now' },
  },
  {
    id: 'cloud-dev',
    name: 'Cloud Dev',
    type: 'cloud',
    url: 'https://dev--prismcode.vercel.app',
    status: 'running',
    lastDeploy: '15 mins ago',
    branch: 'develop',
    healthCheck: { status: 'healthy', latency: 45, lastCheck: '30s ago' },
  },
  {
    id: 'staging',
    name: 'Staging',
    type: 'staging',
    url: 'https://staging--prismcode.vercel.app',
    status: 'running',
    lastDeploy: '2 hours ago',
    branch: 'main',
    healthCheck: { status: 'healthy', latency: 52, lastCheck: '1m ago' },
  },
  {
    id: 'preview-342',
    name: 'PR #342 Preview',
    type: 'cloud',
    url: 'https://pr-342--prismcode.vercel.app',
    status: 'building',
    branch: 'feature/code-review',
  },
  {
    id: 'custom',
    name: 'Custom URL',
    type: 'custom',
    url: '',
    status: 'idle',
  },
];

interface SandboxEnvironmentSelectorProps {
  onSelect?: (env: Environment) => void;
  currentEnvId?: string;
  compact?: boolean;
}

export function SandboxEnvironmentSelector({ 
  onSelect, 
  currentEnvId = 'local',
  compact = false,
}: SandboxEnvironmentSelectorProps) {
  const [environments, setEnvironments] = useState<Environment[]>(mockEnvironments);
  const [selectedEnv, setSelectedEnv] = useState<Environment | null>(
    mockEnvironments.find(e => e.id === currentEnvId) || null
  );
  const [customUrl, setCustomUrl] = useState('');
  const [isOpen, setIsOpen] = useState(!compact);

  const handleSelect = (env: Environment) => {
    setSelectedEnv(env);
    onSelect?.(env);
    if (compact) setIsOpen(false);
  };

  const getStatusColor = (status: Environment['status']) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'building': return 'bg-amber-500 animate-pulse';
      case 'failed': return 'bg-red-500';
      case 'provisioning': return 'bg-blue-500 animate-pulse';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: Environment['status']) => {
    switch (status) {
      case 'running': return 'Running';
      case 'building': return 'Building...';
      case 'failed': return 'Failed';
      case 'provisioning': return 'Provisioning...';
      default: return 'Idle';
    }
  };

  const getHealthBadge = (health?: Environment['healthCheck']) => {
    if (!health) return null;
    const colors = {
      healthy: 'text-green-500 border-green-500/30 bg-green-500/10',
      degraded: 'text-amber-500 border-amber-500/30 bg-amber-500/10',
      unhealthy: 'text-red-500 border-red-500/30 bg-red-500/10',
    };
    return (
      <Badge variant="outline" className={`text-xs ${colors[health.status]}`}>
        {health.latency}ms
      </Badge>
    );
  };

  // Compact dropdown view
  if (compact && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background hover:bg-muted/50 transition-colors"
      >
        <span className={`w-2 h-2 rounded-full ${getStatusColor(selectedEnv?.status || 'idle')}`} />
        <span className="text-sm font-medium truncate max-w-[150px]">{selectedEnv?.name || 'Select Environment'}</span>
        <span className="text-muted-foreground">▼</span>
      </button>
    );
  }

  return (
    <div className={compact ? 'absolute top-full left-0 mt-1 w-80 z-50 shadow-lg rounded-lg border border-border bg-background' : ''}>
      <div className="space-y-2 p-2">
        {environments.map((env) => (
          <button
            key={env.id}
            onClick={() => handleSelect(env)}
            disabled={env.status === 'provisioning'}
            className={`w-full p-3 rounded-lg border text-left transition-all ${
              selectedEnv?.id === env.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/30'
            } ${env.status === 'provisioning' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${getStatusColor(env.status)}`} />
                <span className="font-medium">{env.name}</span>
              </div>
              <div className="flex items-center gap-1">
                {getHealthBadge(env.healthCheck)}
                <Badge variant="secondary" className="text-xs capitalize">{env.type}</Badge>
              </div>
            </div>
            
            {env.type !== 'custom' ? (
              <div className="text-xs text-muted-foreground truncate">{env.url}</div>
            ) : (
              <input
                type="text"
                placeholder="Enter custom URL..."
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full mt-1 px-2 py-1 text-xs rounded border border-border bg-background"
              />
            )}
            
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {env.branch && <span>🔀 {env.branch}</span>}
              {env.lastDeploy && <span>📦 {env.lastDeploy}</span>}
              {env.uptime && <span>⏱️ {env.uptime}</span>}
              <span className={env.status === 'running' ? 'text-green-500' : env.status === 'failed' ? 'text-red-500' : ''}>
                {getStatusText(env.status)}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="p-2 border-t border-border flex gap-2">
        <Button variant="ghost" size="sm" className="flex-1 text-xs">
          📋 View Logs
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 text-xs">
          🔄 Refresh
        </Button>
        {compact && (
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-xs">
            ✕
          </Button>
        )}
      </div>
    </div>
  );
}

// Standalone page for environment management
export default function EnvironmentsPage() {
  const [selectedEnv, setSelectedEnv] = useState<Environment | null>(mockEnvironments[0]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          Sandbox Environments
        </h1>
        <p className="text-muted-foreground mt-1">
          Select an environment for the preview sandbox
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Environment Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Available Environments</CardTitle>
            <CardDescription>Choose where to run your preview</CardDescription>
          </CardHeader>
          <CardContent>
            <SandboxEnvironmentSelector 
              onSelect={setSelectedEnv}
              currentEnvId={selectedEnv?.id}
            />
          </CardContent>
        </Card>

        {/* Selected Environment Details */}
        <Card>
          <CardHeader>
            <CardTitle>Current Selection</CardTitle>
            <CardDescription>Environment details and actions</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedEnv ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${
                    selectedEnv.status === 'running' ? 'bg-green-500' :
                    selectedEnv.status === 'building' ? 'bg-amber-500 animate-pulse' :
                    selectedEnv.status === 'failed' ? 'bg-red-500' : 'bg-gray-400'
                  }`} />
                  <div>
                    <h3 className="font-semibold text-lg">{selectedEnv.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedEnv.url}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{selectedEnv.status}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Branch</p>
                    <p className="font-medium">{selectedEnv.branch || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Deploy</p>
                    <p className="font-medium">{selectedEnv.lastDeploy || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Health</p>
                    <p className="font-medium">
                      {selectedEnv.healthCheck ? `${selectedEnv.healthCheck.latency}ms` : 'Unknown'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                    Open Preview →
                  </Button>
                  <Button variant="outline">View Logs</Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Select an environment</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
