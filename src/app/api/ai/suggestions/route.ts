import { NextRequest, NextResponse } from 'next/server';
import { aiCalendarService } from '@/lib/ai-calendar-service';

export async function POST(request: NextRequest) {
  try {
    const { events, userPreferences } = await request.json();

    const result = await aiCalendarService.generateEventSuggestions(
      events || [],
      userPreferences
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in suggestions API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}