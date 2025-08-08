"use client";

import { useState } from "react";
import { Brain, TrendingUp, Calendar, Lightbulb, BarChart3 } from "lucide-react";
import { toast } from "sonner";

import { useCalendar } from "@/calendar/contexts/calendar-context";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CalendarInsights {
  insights: string[];
  suggestions: string[];
  productivity_score: number;
}

export function AICalendarInsights() {
  const { events } = useCalendar();
  const [insights, setInsights] = useState<CalendarInsights | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeframe, setTimeframe] = useState<string>("week");

  const getTimeframeRange = (period: string) => {
    const now = new Date();
    const startDate = new Date(now);
    const endDate = new Date(now);

    switch (period) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(now.getMonth() - 3);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    return { startDate, endDate };
  };

  const analyzeCalendar = async () => {
    setIsLoading(true);
    try {
      const timeRange = getTimeframeRange(timeframe);
      
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events,
          timeframe: {
            startDate: timeRange.startDate.toISOString(),
            endDate: timeRange.endDate.toISOString(),
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze calendar');
      }

      if (result.success) {
        setInsights(result.insights);
        toast.success("Calendar analysis complete!");
      } else {
        toast.error(result.error || "Failed to analyze calendar");
      }
    } catch (error) {
      console.error('Error analyzing calendar:', error);
      toast.error("Failed to analyze calendar");
    } finally {
      setIsLoading(false);
    }
  };

  const getProductivityColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getProductivityLabel = (score: number) => {
    if (score >= 8) return "Excellent";
    if (score >= 6) return "Good";
    if (score >= 4) return "Fair";
    return "Needs Improvement";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="size-5 text-purple-600" />
          AI Calendar Insights
        </CardTitle>
        <CardDescription>
          Get AI-powered analysis of your calendar patterns and productivity insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Analysis Period</label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Past Week</SelectItem>
                <SelectItem value="month">Past Month</SelectItem>
                <SelectItem value="quarter">Past Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button 
              onClick={analyzeCalendar}
              disabled={isLoading}
              className="gap-2 w-full sm:w-auto"
            >
              <BarChart3 className="size-4" />
              {isLoading ? "Analyzing..." : "Analyze Calendar"}
            </Button>
          </div>
        </div>

        {insights && (
          <div className="space-y-4">
            {/* Productivity Score */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 rounded-lg border">
              <div className="flex items-center gap-3">
                <TrendingUp className={`size-6 ${getProductivityColor(insights.productivity_score)}`} />
                <div>
                  <h4 className="font-semibold">Productivity Score</h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${getProductivityColor(insights.productivity_score)}`}>
                      {insights.productivity_score}/10
                    </span>
                    <span className={`text-sm ${getProductivityColor(insights.productivity_score)}`}>
                      {getProductivityLabel(insights.productivity_score)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Insights */}
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <Calendar className="size-4" />
                Key Insights
              </h4>
              <div className="space-y-2">
                {insights.insights.map((insight, index) => (
                  <div key={index} className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <Lightbulb className="size-4" />
                Recommendations
              </h4>
              <div className="space-y-2">
                {insights.suggestions.map((suggestion, index) => (
                  <div key={index} className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-sm text-amber-800 dark:text-amber-200">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!insights && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="size-12 mx-auto mb-4 opacity-50" />
            <p>Click "Analyze Calendar" to get AI-powered insights about your calendar patterns and productivity.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}