"use client";

import { useState } from "react";
import { Sparkles, Plus, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { useDisclosure } from "@/hooks/use-disclosure";
import { useCalendar } from "@/calendar/contexts/calendar-context";
import { useAddEvent } from "@/calendar/hooks/use-add-event";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface IProps {
  children: React.ReactNode;
  startDate?: Date;
  startTime?: { hour: number; minute: number };
}

export function AIQuickAddEventDialog({ children, startDate, startTime }: IProps) {
  const { users } = useCalendar();
  const { addEvent, isLoading } = useAddEvent();
  const { isOpen, onClose, onToggle } = useDisclosure();

  const [naturalLanguageInput, setNaturalLanguageInput] = useState("");
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [parsedEvent, setParsedEvent] = useState<any>(null);
  const [enhancedDescription, setEnhancedDescription] = useState("");

  const handleAIParse = async () => {
    if (!naturalLanguageInput.trim()) {
      toast.error("Please enter event details");
      return;
    }

    setIsProcessingAI(true);
    try {
      const response = await fetch('/api/ai/parse-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: naturalLanguageInput,
          currentDate: startDate || new Date(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to parse event');
      }

      if (result.success) {
        setParsedEvent(result.event);
        toast.success("Event parsed successfully!");
        
        // Also enhance the description
        handleEnhanceDescription(result.event.title, result.event.description);
      } else {
        toast.error(result.error || "Failed to parse event");
      }
    } catch (error) {
      console.error('Error parsing event:', error);
      toast.error("Failed to parse event with AI");
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleEnhanceDescription = async (title: string, description: string) => {
    try {
      const response = await fetch('/api/ai/enhance-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          context: naturalLanguageInput,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setEnhancedDescription(result.enhancedDescription);
      }
    } catch (error) {
      console.error('Error enhancing description:', error);
    }
  };

  const handleCreateEvent = async () => {
    if (!parsedEvent) {
      toast.error("Please parse the event first");
      return;
    }

    try {
      // Convert the parsed event to the format expected by addEvent
      const eventData = {
        title: parsedEvent.title,
        description: enhancedDescription || parsedEvent.description,
        startDate: new Date(parsedEvent.startDate),
        startTime: parsedEvent.startTime,
        endDate: new Date(parsedEvent.startDate), // Same day for now
        endTime: parsedEvent.endTime,
        color: parsedEvent.color,
        user: users[0]?.id || "",
      };

      await addEvent(eventData);
      toast.success("AI-powered event created successfully!");
      
      // Reset form
      setNaturalLanguageInput("");
      setParsedEvent(null);
      setEnhancedDescription("");
      onClose();
    } catch (error) {
      toast.error("Failed to create event");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!parsedEvent) {
        handleAIParse();
      } else {
        handleCreateEvent();
      }
    }
  };

  const handleClear = () => {
    setNaturalLanguageInput("");
    setParsedEvent(null);
    setEnhancedDescription("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-purple-600" />
            AI Quick Add Event
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Describe your event in natural language
            </label>
            <Textarea
              placeholder="e.g., 'Meeting with John tomorrow at 2pm for project review' or 'Doctor appointment Friday at 10:30'"
              value={naturalLanguageInput}
              onChange={(e) => setNaturalLanguageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[80px]"
              autoFocus
            />
          </div>

          {!parsedEvent ? (
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleAIParse} 
                disabled={isProcessingAI || !naturalLanguageInput.trim()}
                className="gap-2"
              >
                <Wand2 className="size-4" />
                {isProcessingAI ? "Processing..." : "Parse with AI"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                  ✨ Parsed Event Details
                </h4>
                <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                  <p><strong>Title:</strong> {parsedEvent.title}</p>
                  <p><strong>Date:</strong> {new Date(parsedEvent.startDate).toDateString()}</p>
                  <p>
                    <strong>Time:</strong> {
                      String(parsedEvent.startTime.hour).padStart(2, '0')
                    }:{
                      String(parsedEvent.startTime.minute).padStart(2, '0')
                    } - {
                      String(parsedEvent.endTime.hour).padStart(2, '0')
                    }:{
                      String(parsedEvent.endTime.minute).padStart(2, '0')
                    }
                  </p>
                  <p><strong>Color:</strong> {parsedEvent.color}</p>
                  <div>
                    <strong>Description:</strong>
                    <p className="mt-1 text-xs">
                      {enhancedDescription || parsedEvent.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateEvent} 
                  disabled={isLoading}
                  className="gap-2"
                >
                  <Plus className="size-4" />
                  {isLoading ? "Creating..." : "Create Event"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}