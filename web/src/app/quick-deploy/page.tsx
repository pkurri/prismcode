'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DeployTarget {
  id: string;
  name: string;
  provider: 'vercel' | 'aws' | 'gcp' | 'azure' | 'cloudflare';
  icon: string;
  envType: 'production' | 'staging' | 'preview';
  status: 'ready' | 'deploying' | 'error';
  lastDeploy?: string;
  url?: string;
}

interface DeployAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  action: string;
  dangerous?: boolean;
}

const deployTargets: DeployTarget[] = [
  { id: 'vercel-prod', name: 'Production', provider: 'vercel', icon: '▲', envType: 'production', status: 'ready', lastDeploy: '2 hours ago', url: 'https://prismcode.dev' },
  { id: 'vercel-staging', name: 'Staging', provider: 'vercel', icon: '▲', envType: 'staging', status: 'ready', lastDeploy: '30 mins ago', url: 'https://staging.prismcode.dev' },
  { id: 'vercel-preview', name: 'Preview', provider: 'vercel', icon: '▲', envType: 'preview', status: 'ready' },
  { id: 'aws-prod', name: 'AWS Production', provider: 'aws', icon: '☁️', envType: 'production', status: 'ready', url: 'https://aws.prismcode.dev' },
];

const quickActions: DeployAction[] = [
  { id: 'deploy-staging', label: 'Deploy to Staging', description: 'Deploy current branch to staging', icon: '🚀', action: 'deploy_staging' },
  { id: 'deploy-prod', label: 'Deploy to Production', description: 'Deploy main branch to production', icon: '🌐', action: 'deploy_production', dangerous: true },
  { id: 'preview-pr', label: 'Create Preview', description: 'Create preview for current PR', icon: '👁️', action: 'create_preview' },
  { id: 'rollback', label: 'Rollback', description: 'Rollback to previous version', icon: '⏪', action: 'rollback', dangerous: true },
];

const envColors: Record<string, string> = {
  production: 'bg-red-500/10 text-red-500 border-red-500/30',
  staging: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  preview: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
};

export default function OneClickDeployPage() {
  const [deploying, setDeploying] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<DeployAction | null>(null);

  const handleDeploy = async (action: DeployAction) => {
    if (action.dangerous) {
      setShowConfirm(action);
      return;
    }
    executeDeploy(action);
  };

  const executeDeploy = async (action: DeployAction) => {
    setDeploying(action.id);
    setShowConfirm(null);
    
    // Simulate deployment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Executing deploy action:', action.action);
    setDeploying(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          One-Click Deploy
        </h1>
        <p className="text-muted-foreground">Deploy your application with a single click</p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        {quickActions.map(action => (
          <Card 
            key={action.id}
            className={`cursor-pointer transition-all hover:shadow-md ${action.dangerous ? 'border-red-500/30' : ''}`}
            onClick={() => handleDeploy(action)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                  action.dangerous ? 'bg-red-500/10' : 'bg-primary/10'
                }`}>
                  {action.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{action.label}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
                {deploying === action.id ? (
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-muted-foreground">→</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Deploy Targets */}
      <Card>
        <CardHeader>
          <CardTitle>Deploy Targets</CardTitle>
          <CardDescription>Available deployment environments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {deployTargets.map(target => (
            <div key={target.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{target.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{target.name}</h4>
                    <Badge variant="outline" className={envColors[target.envType]}>
                      {target.envType}
                    </Badge>
                  </div>
                  {target.url && (
                    <a href={target.url} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary">
                      {target.url} ↗
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {target.lastDeploy && (
                  <span className="text-sm text-muted-foreground">{target.lastDeploy}</span>
                )}
                <span className={`w-3 h-3 rounded-full ${
                  target.status === 'ready' ? 'bg-green-500' :
                  target.status === 'deploying' ? 'bg-blue-500 animate-pulse' : 'bg-red-500'
                }`} />
                <Button variant="outline" size="sm">Deploy</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-500">⚠️ Confirm {showConfirm.label}</CardTitle>
              <CardDescription>This action may affect production. Are you sure?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">{showConfirm.description}</p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowConfirm(null)}>Cancel</Button>
                <Button variant="destructive" onClick={() => executeDeploy(showConfirm)}>
                  Confirm {showConfirm.label}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
