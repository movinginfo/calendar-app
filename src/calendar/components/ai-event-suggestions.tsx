"use client";

import { useState } from "react";
import { Lightbulb, RefreshCw, Plus } from "lucide-react";
import { toast } from "sonner";

import { useCalendar } from "@/calendar/contexts/calendar-context";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AIEventSuggestions() {
  const { events, workingHours } = useCalendar();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateSuggestions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events,
          userPreferences: {
            workingHours,
            commonMeetingTypes: ["Team standup", "Project review", "One-on-one", "Planning session"],
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate suggestions');
      }

      if (result.success) {
        setSuggestions(result.suggestions);
        toast.success("AI suggestions generated!");
      } else {
        toast.error(result.error || "Failed to generate suggestions");
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error("Failed to generate suggestions");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="size-5 text-amber-600" />
          AI Event Suggestions
        </CardTitle>
        <CardDescription>
          Get intelligent suggestions for optimizing your calendar and productivity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Based on your calendar patterns and productivity best practices
          </p>
          <Button 
            onClick={generateSuggestions}
            disabled={isLoading}
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? "Generating..." : "Get Suggestions"}
          </Button>
        </div>

        {suggestions.length > 0 && (
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      {suggestion}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {suggestions.length === 0 && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="size-12 mx-auto mb-4 opacity-50" />
            <p>Click "Get Suggestions" to receive AI-powered recommendations for your calendar.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}