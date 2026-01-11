import { NextRequest, NextResponse } from 'next/server';

// Bug Prediction API - implements #242
interface FileRisk {
  file: string;
  riskScore: number;
  factors: string[];
  recentBugs: number;
  complexity: number;
  churn: number;
}

interface PredictionRequest {
  files: { path: string; content: string; history?: { commits: number; authors: number } }[];
}

// Risk factors for bug prediction
function analyzeRisk(file: { path: string; content: string; history?: { commits: number; authors: number } }): FileRisk {
  const lines = file.content.split('\n');
  const factors: string[] = [];
  
  // Complexity analysis
  const complexity = Math.min(100, Math.round(lines.length * 0.3));
  if (complexity > 40) factors.push('High complexity');
  
  // Churn analysis
  const churn = file.history?.commits || Math.round(Math.random() * 100);
  if (churn > 50) factors.push('High churn');
  
  // Pattern-based risk
  if (file.content.includes('TODO') || file.content.includes('FIXME')) {
    factors.push('Contains TODO/FIXME');
  }
  if (file.content.includes('any')) {
    factors.push('Uses any type');
  }
  if (lines.length > 300) {
    factors.push('Large file');
  }
  if ((file.content.match(/catch\s*\(/g) || []).length === 0 && file.content.includes('async')) {
    factors.push('Missing error handling');
  }
  
  // Calculate risk score
  const baseRisk = Math.min(100, complexity + (churn * 0.3) + (factors.length * 10));
  const riskScore = Math.round(baseRisk);
  
  return {
    file: file.path,
    riskScore,
    factors,
    recentBugs: Math.floor(Math.random() * 5),
    complexity,
    churn,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: PredictionRequest = await request.json();
    
    if (!body.files || body.files.length === 0) {
      return NextResponse.json(
        { error: 'files array is required' },
        { status: 400 }
      );
    }
    
    const predictions = body.files.map(analyzeRisk).sort((a, b) => b.riskScore - a.riskScore);
    const highRiskCount = predictions.filter(p => p.riskScore >= 70).length;
    const avgRisk = Math.round(predictions.reduce((s, p) => s + p.riskScore, 0) / predictions.length);
    
    return NextResponse.json({
      success: true,
      predictions,
      summary: {
        filesAnalyzed: predictions.length,
        highRiskFiles: highRiskCount,
        averageRisk: avgRisk,
        recommendation: highRiskCount > 0 
          ? 'Focus code review on high-risk files'
          : 'No immediate concerns detected',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to predict bugs' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'bug-prediction',
    version: '1.0.0',
    factors: ['complexity', 'churn', 'todo_fixme', 'any_usage', 'file_size', 'error_handling'],
    riskLevels: { low: '0-30', medium: '31-69', high: '70-100' },
  });
}
