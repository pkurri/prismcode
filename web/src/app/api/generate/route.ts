import { NextResponse } from 'next/server';

// Service connecting to text-to-ui.ts, live-preview.ts backend modules
const visualService = {
  async generate(prompt: string) {
    // In production: Connect to TextToUI from src/advanced/text-to-ui.ts
    // This would invoke the LLM to generate code

    const mockCode = `
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function GeneratedComponent() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Generated from: "${prompt}"</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-lg border border-dashed text-center">
          <p className="text-muted-foreground">Placeholder Content</p>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline">Cancel</Button>
          <Button>Submit</Button>
        </div>
      </CardContent>
    </Card>
  );
}
    `.trim();

    return {
      code: mockCode,
      previewUrl: '/preview/temp/12345',
      tokens: 450,
      model: 'gpt-4o',
    };
  },

  async getHistory() {
    return [
      { id: 'gen_1', prompt: 'Login form with social auth', date: '2024-01-09T14:30:00Z' },
      { id: 'gen_2', prompt: 'Dashboard stats card', date: '2024-01-09T15:15:00Z' },
    ];
  },
};

export async function GET(request: Request) {
  try {
    return NextResponse.json({ success: true, data: await visualService.getHistory() });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch history' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Missing prompt' }, { status: 400 });
    }

    const result = await visualService.generate(prompt);

    return NextResponse.json({
      success: true,
      ...result,
      id: `gen_${Date.now()}`,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Generation failed' }, { status: 500 });
  }
}
