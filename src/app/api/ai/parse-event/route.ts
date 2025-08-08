import { NextRequest, NextResponse } from 'next/server';
import { aiCalendarService } from '@/lib/ai-calendar-service';

export async function POST(request: NextRequest) {
  try {
    const { input, currentDate } = await request.json();

    if (!input?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Input is required' },
        { status: 400 }
      );
    }

    const result = await aiCalendarService.parseEventFromText(
      input,
      currentDate ? new Date(currentDate) : new Date()
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in parse-event API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}