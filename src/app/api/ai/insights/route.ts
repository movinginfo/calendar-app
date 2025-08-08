import { NextRequest, NextResponse } from 'next/server';
import { aiCalendarService } from '@/lib/ai-calendar-service';

export async function POST(request: NextRequest) {
  try {
    const { events, timeframe } = await request.json();

    if (!timeframe?.startDate || !timeframe?.endDate) {
      return NextResponse.json(
        { success: false, error: 'Timeframe with startDate and endDate is required' },
        { status: 400 }
      );
    }

    const result = await aiCalendarService.analyzeCalendarInsights(
      events || [],
      {
        startDate: new Date(timeframe.startDate),
        endDate: new Date(timeframe.endDate),
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in insights API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}