import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';

// AI Event Schema for structured generation
const eventGenerationSchema = z.object({
  title: z.string().describe('A clear, concise event title'),
  description: z.string().describe('A detailed description of the event'),
  startDate: z.string().describe('Start date in ISO format (YYYY-MM-DD)'),
  startTime: z.object({
    hour: z.number().min(0).max(23).describe('Hour in 24-hour format'),
    minute: z.number().min(0).max(59).describe('Minute'),
  }).describe('Start time'),
  endTime: z.object({
    hour: z.number().min(0).max(23).describe('Hour in 24-hour format'),
    minute: z.number().min(0).max(59).describe('Minute'),
  }).describe('End time'),
  color: z.enum(['blue', 'green', 'red', 'yellow', 'purple', 'orange', 'gray']).describe('Event color'),
});

const calendarInsightSchema = z.object({
  insights: z.array(z.string()).describe('Array of calendar insights and observations'),
  suggestions: z.array(z.string()).describe('Array of actionable suggestions for better calendar management'),
  productivity_score: z.number().min(1).max(10).describe('Productivity score based on calendar patterns'),
});

// Get AI model based on environment configuration
function getAIModel() {
  const provider = process.env.AI_PROVIDER || 'openai';
  
  if (provider === 'google' && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return google('gemini-1.5-flash');
  } else if (process.env.OPENAI_API_KEY) {
    return openai('gpt-4o-mini');
  } else {
    // Return null to indicate demo mode
    return null;
  }
}

export class AICalendarService {
  private model;
  private isDemoMode: boolean;

  constructor() {
    this.model = getAIModel();
    this.isDemoMode = this.model === null;
  }

  /**
   * Parse natural language input and generate structured event data
   */
  async parseEventFromText(naturalLanguageInput: string, currentDate: Date = new Date()) {
    try {
      // Demo mode - return a mock response
      if (this.isDemoMode) {
        return this.getMockEventParsing(naturalLanguageInput, currentDate);
      }

      const { object } = await generateObject({
        model: this.model,
        schema: eventGenerationSchema,
        prompt: `Parse the following natural language input into a structured calendar event. 
        Current date and time: ${currentDate.toISOString()}
        
        Input: "${naturalLanguageInput}"
        
        Guidelines:
        - If no date is specified, assume today
        - If no time is specified, suggest appropriate business hours (9 AM - 5 PM)
        - If duration isn't specified, assume 1 hour for meetings, 30 minutes for calls
        - Choose an appropriate color based on the event type (blue for meetings, green for personal, red for urgent, etc.)
        - Create a meaningful description that expands on the title
        - Handle relative dates like "tomorrow", "next week", "Monday", etc.
        
        Examples:
        - "Meeting with John tomorrow at 2pm" 
        - "Doctor appointment Friday at 10:30"
        - "Team standup every Monday at 9am"
        - "Lunch with Sarah next Tuesday"`,
      });

      return {
        success: true,
        event: object,
      };
    } catch (error) {
      console.error('Error parsing event from text:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to parse event',
      };
    }
  }

  /**
   * Demo mode mock event parsing
   */
  private getMockEventParsing(input: string, currentDate: Date) {
    // Simple parsing logic for demo purposes
    const lowerInput = input.toLowerCase();
    
    // Extract time if present
    const timeMatch = input.match(/(\d{1,2}):?(\d{0,2})\s*(am|pm|AM|PM)/);
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(currentDate.getDate() + 1);
    
    let startHour = 14; // 2 PM default
    let startMinute = 0;
    
    if (timeMatch) {
      startHour = parseInt(timeMatch[1]);
      startMinute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      
      if (timeMatch[3].toLowerCase() === 'pm' && startHour !== 12) {
        startHour += 12;
      } else if (timeMatch[3].toLowerCase() === 'am' && startHour === 12) {
        startHour = 0;
      }
    }
    
    // Determine event date
    let eventDate = currentDate;
    if (lowerInput.includes('tomorrow')) {
      eventDate = tomorrow;
    }
    
    // Determine color based on event type
    let color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange' | 'gray' = 'blue';
    if (lowerInput.includes('doctor') || lowerInput.includes('medical') || lowerInput.includes('health')) {
      color = 'red';
    } else if (lowerInput.includes('lunch') || lowerInput.includes('dinner') || lowerInput.includes('personal')) {
      color = 'green';
    } else if (lowerInput.includes('urgent') || lowerInput.includes('important')) {
      color = 'red';
    } else if (lowerInput.includes('meeting') || lowerInput.includes('call')) {
      color = 'blue';
    }
    
    // Extract title (first part before details)
    let title = input;
    if (input.includes(' at ')) {
      title = input.split(' at ')[0];
    }
    if (input.includes(' on ')) {
      title = input.split(' on ')[0];
    }
    if (input.includes(' for ')) {
      title = input.split(' for ')[0];
    }
    
    return {
      success: true,
      event: {
        title: title.trim(),
        description: `${title.trim()} - Automatically created from: "${input}"`,
        startDate: eventDate.toISOString().split('T')[0],
        startTime: {
          hour: startHour,
          minute: startMinute,
        },
        endTime: {
          hour: startHour + 1,
          minute: startMinute,
        },
        color,
      },
    };
  }

  /**
   * Generate smart event suggestions based on existing calendar data
   */
  async generateEventSuggestions(existingEvents: any[], userPreferences?: { workingHours?: any, commonMeetingTypes?: string[] }) {
    try {
      // Demo mode - return mock suggestions
      if (this.isDemoMode) {
        return {
          success: true,
          suggestions: [
            "Schedule a 15-minute break between back-to-back meetings to avoid burnout",
            "Block focus time from 9-11 AM daily for deep work when you're most productive",
            "Add a weekly team retrospective on Fridays to improve collaboration",
            "Schedule a monthly one-on-one with each team member for better communication",
            "Block time for email processing twice daily (10 AM and 3 PM) to reduce interruptions"
          ],
        };
      }

      const eventsContext = existingEvents.map(event => ({
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        description: event.description,
      }));

      const { text } = await generateText({
        model: this.model,
        prompt: `Based on the following calendar events and patterns, suggest 3-5 smart event suggestions that would be beneficial for the user's productivity and schedule optimization.

        Existing events: ${JSON.stringify(eventsContext, null, 2)}
        
        User preferences: ${JSON.stringify(userPreferences, null, 2)}
        
        Consider:
        - Gaps in the schedule that could be used for focused work
        - Missing recurring activities (breaks, planning time, exercise)
        - Work-life balance improvements
        - Meeting optimization opportunities
        - Time for learning or skill development
        
        Return suggestions as a JSON array of strings, each suggestion being actionable and specific.`,
      });

      const suggestions = JSON.parse(text);
      return {
        success: true,
        suggestions: Array.isArray(suggestions) ? suggestions : [text],
      };
    } catch (error) {
      console.error('Error generating event suggestions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate suggestions',
      };
    }
  }

  /**
   * Analyze calendar patterns and provide insights
   */
  async analyzeCalendarInsights(events: any[], timeframe: { startDate: Date; endDate: Date }) {
    try {
      // Demo mode - return mock insights
      if (this.isDemoMode) {
        const eventCount = events.filter(event => {
          const eventDate = new Date(event.startDate);
          return eventDate >= timeframe.startDate && eventDate <= timeframe.endDate;
        }).length;

        return {
          success: true,
          insights: {
            insights: [
              `You have ${eventCount} events in the selected timeframe, indicating ${eventCount > 15 ? 'a busy' : eventCount > 8 ? 'a moderately busy' : 'a light'} schedule`,
              "Most of your meetings are scheduled during standard business hours (9 AM - 5 PM)",
              "You have good variety in event types, balancing meetings, personal time, and project work",
              eventCount > 10 ? "Consider adding buffer time between meetings to avoid scheduling conflicts" : "Your schedule has good spacing between events"
            ],
            suggestions: [
              "Block 30-60 minutes of focus time daily for deep work",
              "Schedule breaks between consecutive meetings to improve productivity",
              "Consider batching similar types of meetings on the same days",
              "Add recurring time for planning and reflection at the end of each week",
              "Ensure you have adequate time blocked for urgent tasks and unexpected requests"
            ],
            productivity_score: eventCount > 20 ? 6 : eventCount > 15 ? 7 : eventCount > 10 ? 8 : eventCount > 5 ? 9 : 7
          },
        };
      }

      const eventsInTimeframe = events.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate >= timeframe.startDate && eventDate <= timeframe.endDate;
      });

      const { object } = await generateObject({
        model: this.model,
        schema: calendarInsightSchema,
        prompt: `Analyze the following calendar events and provide insights about productivity, scheduling patterns, and recommendations for improvement.

        Events (${timeframe.startDate.toDateString()} to ${timeframe.endDate.toDateString()}):
        ${JSON.stringify(eventsInTimeframe, null, 2)}

        Analyze:
        - Meeting frequency and distribution
        - Time blocks for focused work
        - Work-life balance indicators
        - Peak productivity hours
        - Calendar density and potential over-scheduling
        - Types of activities and their balance
        
        Provide specific, actionable insights and suggestions.`,
      });

      return {
        success: true,
        insights: object,
      };
    } catch (error) {
      console.error('Error analyzing calendar insights:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze calendar',
      };
    }
  }

  /**
   * Enhance event descriptions with AI-generated content
   */
  async enhanceEventDescription(title: string, basicDescription: string, context?: string) {
    try {
      // Demo mode - return enhanced description
      if (this.isDemoMode) {
        const enhancements = {
          'meeting': 'This meeting will focus on aligning on key objectives and next steps. Please come prepared with any questions or updates.',
          'doctor': 'Remember to bring your insurance card and any relevant medical records. Arrive 15 minutes early for check-in.',
          'lunch': 'A great opportunity to catch up and discuss ongoing projects in a relaxed setting.',
          'call': 'Please ensure you have a stable internet connection and test your audio/video beforehand.',
          'review': 'Come prepared with progress updates and any blockers that need discussion.',
          'training': 'Bring a notebook for taking notes and be ready to participate actively in discussions.',
        };

        const lowerTitle = title.toLowerCase();
        let enhancedDesc = basicDescription;

        for (const [keyword, enhancement] of Object.entries(enhancements)) {
          if (lowerTitle.includes(keyword)) {
            enhancedDesc = `${basicDescription} ${enhancement}`;
            break;
          }
        }

        if (enhancedDesc === basicDescription) {
          enhancedDesc = `${basicDescription} This event is an important part of your schedule. Make sure to prepare accordingly and allocate sufficient time.`;
        }

        return {
          success: true,
          enhancedDescription: enhancedDesc,
        };
      }

      const { text } = await generateText({
        model: this.model,
        prompt: `Enhance the following event description to be more detailed, professional, and actionable:

        Title: ${title}
        Basic Description: ${basicDescription}
        Additional Context: ${context || 'No additional context provided'}

        Generate an enhanced description that:
        - Provides clear objectives or agenda items
        - Includes relevant preparation notes if applicable
        - Maintains a professional tone
        - Is concise but informative (2-3 sentences)
        - Adds value beyond the basic description`,
      });

      return {
        success: true,
        enhancedDescription: text.trim(),
      };
    } catch (error) {
      console.error('Error enhancing event description:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to enhance description',
      };
    }
  }

  /**
   * Suggest optimal meeting times based on participants' schedules
   */
  async suggestOptimalMeetingTimes(
    participants: string[],
    duration: number, // in minutes
    preferredTimeframe: { startDate: Date; endDate: Date },
    existingEvents: any[]
  ) {
    try {
      const { text } = await generateText({
        model: this.model,
        prompt: `Based on the following information, suggest 3-5 optimal meeting times:

        Participants: ${participants.join(', ')}
        Meeting Duration: ${duration} minutes
        Preferred Timeframe: ${preferredTimeframe.startDate.toDateString()} to ${preferredTimeframe.endDate.toDateString()}
        
        Existing Events: ${JSON.stringify(existingEvents, null, 2)}

        Consider:
        - Avoiding conflicts with existing events
        - Optimal meeting times (typically 9 AM - 5 PM on weekdays)
        - Allowing buffer time between meetings
        - Time zone considerations if applicable
        - Energy levels (avoid right after lunch, early mornings)

        Return suggestions as a JSON array with format:
        [
          {
            "date": "YYYY-MM-DD",
            "startTime": { "hour": 14, "minute": 0 },
            "endTime": { "hour": 15, "minute": 0 },
            "reasoning": "Brief explanation why this time is optimal"
          }
        ]`,
      });

      const suggestions = JSON.parse(text);
      return {
        success: true,
        suggestions: Array.isArray(suggestions) ? suggestions : [],
      };
    } catch (error) {
      console.error('Error suggesting meeting times:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to suggest meeting times',
      };
    }
  }
}

// Export singleton instance
export const aiCalendarService = new AICalendarService();