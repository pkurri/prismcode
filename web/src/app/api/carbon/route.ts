import { NextRequest, NextResponse } from 'next/server';

// Carbon Footprint API - implements #228
interface CarbonAnalysis {
  file: string;
  co2Grams: number;
  energyKwh: number;
  rating: 'A' | 'B' | 'C' | 'D' | 'E';
  hotspots: CarbonHotspot[];
}

interface CarbonHotspot {
  line: number;
  function: string;
  issue: string;
  impact: 'high' | 'medium' | 'low';
  suggestion: string;
  savingsPercent: number;
}

interface CarbonRequest {
  files: { path: string; content: string }[];
  language: string;
}

// Patterns that indicate high energy consumption
const carbonPatterns = [
  { pattern: /for\s*\([^)]+\)\s*{\s*for/g, issue: 'Nested loops with O(n²) complexity', impact: 'high' as const, suggestion: 'Use Map/Set for O(n) lookup', savings: 45 },
  { pattern: /\.forEach\([^)]+\)\s*{\s*\.forEach/g, issue: 'Nested forEach iterations', impact: 'high' as const, suggestion: 'Flatten to single iteration', savings: 40 },
  { pattern: /await\s+\w+\s*\([^)]*\)\s*;?\s*\n\s*await/g, issue: 'Sequential async calls', impact: 'medium' as const, suggestion: 'Use Promise.all for parallel execution', savings: 30 },
  { pattern: /JSON\.parse\(JSON\.stringify/g, issue: 'Deep clone via JSON serialization', impact: 'medium' as const, suggestion: 'Use structuredClone or lodash cloneDeep', savings: 25 },
  { pattern: /\.sort\(\)\.filter\(\)/g, issue: 'Sort before filter', impact: 'low' as const, suggestion: 'Filter first, then sort smaller array', savings: 15 },
];

function analyzeCarbon(file: { path: string; content: string }): CarbonAnalysis {
  const hotspots: CarbonHotspot[] = [];
  const lines = file.content.split('\n');
  
  carbonPatterns.forEach(({ pattern, issue, impact, suggestion, savings }) => {
    const matches = file.content.match(pattern);
    if (matches) {
      // Find line number
      const index = file.content.indexOf(matches[0]);
      const lineNumber = file.content.substring(0, index).split('\n').length;
      hotspots.push({
        line: lineNumber,
        function: 'detected',
        issue,
        impact,
        suggestion,
        savingsPercent: savings,
      });
    }
  });
  
  // Calculate carbon score based on file complexity
  const complexity = lines.length + (hotspots.length * 20);
  const co2Grams = Math.round(complexity * 0.5);
  const energyKwh = parseFloat((complexity * 0.002).toFixed(3));
  
  let rating: 'A' | 'B' | 'C' | 'D' | 'E';
  if (hotspots.length === 0 && lines.length < 100) rating = 'A';
  else if (hotspots.length <= 1) rating = 'B';
  else if (hotspots.length <= 2) rating = 'C';
  else if (hotspots.length <= 4) rating = 'D';
  else rating = 'E';
  
  return {
    file: file.path,
    co2Grams,
    energyKwh,
    rating,
    hotspots,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: CarbonRequest = await request.json();
    
    if (!body.files || body.files.length === 0) {
      return NextResponse.json(
        { error: 'files array is required' },
        { status: 400 }
      );
    }
    
    const analyses = body.files.map(analyzeCarbon);
    const totalCO2 = analyses.reduce((s, a) => s + a.co2Grams, 0);
    const totalHotspots = analyses.reduce((s, a) => s + a.hotspots.length, 0);
    const potentialSavings = analyses
      .flatMap(a => a.hotspots)
      .reduce((s, h) => s + h.savingsPercent, 0);
    
    return NextResponse.json({
      success: true,
      analyses,
      summary: {
        totalFiles: analyses.length,
        totalCO2Grams: totalCO2,
        totalHotspots,
        potentialSavingsPercent: Math.min(potentialSavings, 100),
        overallRating: analyses.every(a => a.rating === 'A') ? 'A' :
                       analyses.some(a => a.rating === 'E') ? 'E' :
                       analyses.some(a => a.rating === 'D') ? 'D' : 'C',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to analyze carbon footprint' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'carbon-analyzer',
    version: '1.0.0',
    metrics: ['co2_grams', 'energy_kwh', 'rating'],
    supportedLanguages: ['typescript', 'javascript', 'python', 'go', 'java'],
    ratings: ['A', 'B', 'C', 'D', 'E'],
  });
}
