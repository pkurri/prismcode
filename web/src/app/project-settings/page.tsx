'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

interface ProjectSettings {
  general: {
    name: string;
    description: string;
    visibility: 'public' | 'private' | 'internal';
    defaultBranch: string;
  };
  ai: {
    defaultModel: string;
    routingStrategy: 'quality' | 'speed' | 'cost';
    autoReview: boolean;
    autoTests: boolean;
  };
  integrations: {
    github: boolean;
    slack: boolean;
    jira: boolean;
    vercel: boolean;
  };
  security: {
    requireApproval: boolean;
    protectedBranches: string[];
    secretScanning: boolean;
    dependencyAlerts: boolean;
  };
}

const initialSettings: ProjectSettings = {
  general: {
    name: 'PrismCode',
    description: 'AI-Powered Multi-Agent Code Intelligence Platform',
    visibility: 'private',
    defaultBranch: 'main',
  },
  ai: {
    defaultModel: 'gpt-4-turbo',
    routingStrategy: 'quality',
    autoReview: true,
    autoTests: false,
  },
  integrations: {
    github: true,
    slack: true,
    jira: false,
    vercel: true,
  },
  security: {
    requireApproval: true,
    protectedBranches: ['main', 'develop'],
    secretScanning: true,
    dependencyAlerts: true,
  },
};

export default function ProjectSettingsPage() {
  const [settings, setSettings] = useState(initialSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = <K extends keyof ProjectSettings>(
    category: K,
    key: keyof ProjectSettings[K],
    value: unknown
  ) => {
    setSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], [key]: value },
    }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    console.log('Saving settings:', settings);
    setHasChanges(false);
    // In production, save to backend
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Project Settings
          </h1>
          <p className="text-muted-foreground">Configure your project preferences</p>
        </div>
        <Button 
          onClick={saveSettings} 
          disabled={!hasChanges}
          className="bg-gradient-to-r from-violet-600 to-purple-600 text-white"
        >
          {hasChanges ? 'Save Changes' : 'Saved'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="ai">AI Settings</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic project configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Project Name</label>
                <Input
                  value={settings.general.name}
                  onChange={(e) => updateSetting('general', 'name', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={settings.general.description}
                  onChange={(e) => updateSetting('general', 'description', e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-md border border-border bg-background text-sm min-h-[80px]"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Visibility</label>
                <select
                  value={settings.general.visibility}
                  onChange={(e) => updateSetting('general', 'visibility', e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-md border border-border bg-background text-sm"
                >
                  <option value="private">Private</option>
                  <option value="internal">Internal (Team)</option>
                  <option value="public">Public</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Default Branch</label>
                <Input
                  value={settings.general.defaultBranch}
                  onChange={(e) => updateSetting('general', 'defaultBranch', e.target.value)}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI Configuration</CardTitle>
              <CardDescription>Configure AI behavior for this project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Default AI Model</label>
                <select
                  value={settings.ai.defaultModel}
                  onChange={(e) => updateSetting('ai', 'defaultModel', e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-md border border-border bg-background text-sm"
                >
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="claude-3-sonnet">Claude 3.5 Sonnet</option>
                  <option value="gemini-pro">Gemini 1.5 Pro</option>
                  <option value="deepseek-coder">DeepSeek Coder</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Routing Strategy</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {['quality', 'speed', 'cost'].map((strategy) => (
                    <button
                      key={strategy}
                      onClick={() => updateSetting('ai', 'routingStrategy', strategy)}
                      className={`p-3 rounded-lg border text-center capitalize ${
                        settings.ai.routingStrategy === strategy
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {strategy === 'quality' && '⭐'}
                      {strategy === 'speed' && '⚡'}
                      {strategy === 'cost' && '💰'}
                      <span className="block text-sm mt-1">{strategy}</span>
                    </button>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto Review PRs</p>
                  <p className="text-sm text-muted-foreground">Automatically run AI review on new PRs</p>
                </div>
                <button
                  onClick={() => updateSetting('ai', 'autoReview', !settings.ai.autoReview)}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.ai.autoReview ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.ai.autoReview ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto Generate Tests</p>
                  <p className="text-sm text-muted-foreground">Generate test suggestions for new code</p>
                </div>
                <button
                  onClick={() => updateSetting('ai', 'autoTests', !settings.ai.autoTests)}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.ai.autoTests ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.ai.autoTests ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Connect third-party services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'github', name: 'GitHub', icon: '🐙', desc: 'Repository and PR sync' },
                { key: 'slack', name: 'Slack', icon: '💬', desc: 'Notifications and updates' },
                { key: 'jira', name: 'Jira', icon: '📋', desc: 'Issue tracking sync' },
                { key: 'vercel', name: 'Vercel', icon: '▲', desc: 'Deployment integration' },
              ].map(({ key, name, icon, desc }) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <p className="font-medium">{name}</p>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {settings.integrations[key as keyof typeof settings.integrations] && (
                      <Badge variant="secondary" className="text-green-500">Connected</Badge>
                    )}
                    <Button variant="outline" size="sm">
                      {settings.integrations[key as keyof typeof settings.integrations] ? 'Configure' : 'Connect'}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Protect your project and code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'requireApproval', name: 'Require Approval', desc: 'PRs need approval before merge' },
                { key: 'secretScanning', name: 'Secret Scanning', desc: 'Detect exposed secrets in code' },
                { key: 'dependencyAlerts', name: 'Dependency Alerts', desc: 'Alert on vulnerable dependencies' },
              ].map(({ key, name, desc }) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">{name}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                  <button
                    onClick={() => updateSetting('security', key as keyof ProjectSettings['security'], !settings.security[key as keyof ProjectSettings['security']])}
                    className={`w-12 h-6 rounded-full transition-colors ${settings.security[key as keyof ProjectSettings['security']] ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.security[key as keyof ProjectSettings['security']] ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger">
          <Card className="border-red-500/50">
            <CardHeader>
              <CardTitle className="text-red-500">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions - proceed with caution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-red-500/30 bg-red-500/5">
                <div>
                  <p className="font-medium">Transfer Project</p>
                  <p className="text-sm text-muted-foreground">Transfer ownership to another user or organization</p>
                </div>
                <Button variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10">
                  Transfer
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-red-500/30 bg-red-500/5">
                <div>
                  <p className="font-medium">Archive Project</p>
                  <p className="text-sm text-muted-foreground">Mark as read-only and archive</p>
                </div>
                <Button variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10">
                  Archive
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-red-500/30 bg-red-500/5">
                <div>
                  <p className="font-medium text-red-500">Delete Project</p>
                  <p className="text-sm text-muted-foreground">Permanently delete this project and all data</p>
                </div>
                <Button variant="destructive">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
