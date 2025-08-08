import { NextRequest, NextResponse } from 'next/server';
import { aiCalendarService } from '@/lib/ai-calendar-service';

export async function POST(request: NextRequest) {
  try {
    const { title, description, context } = await request.json();

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const result = await aiCalendarService.enhanceEventDescription(
      title,
      description,
      context
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in enhance-description API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}