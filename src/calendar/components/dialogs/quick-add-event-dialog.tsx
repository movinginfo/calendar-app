"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { useDisclosure } from "@/hooks/use-disclosure";
import { useCalendar } from "@/calendar/contexts/calendar-context";
import { useAddEvent } from "@/calendar/hooks/use-add-event";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface IProps {
  children: React.ReactNode;
  startDate?: Date;
  startTime?: { hour: number; minute: number };
}

export function QuickAddEventDialog({ children, startDate, startTime }: IProps) {
  const { users } = useCalendar();
  const { addEvent, isLoading } = useAddEvent();
  const { isOpen, onClose, onToggle } = useDisclosure();

  const [title, setTitle] = useState("");

  const handleQuickAdd = async () => {
    if (!title.trim()) {
      toast.error("Please enter an event title");
      return;
    }

    try {
      const eventStartDate = startDate || new Date();
      const eventStartTime = startTime || { hour: 9, minute: 0 };
      
      await addEvent({
        title: title.trim(),
        description: "Quick event",
        startDate: eventStartDate,
        startTime: eventStartTime,
        endDate: eventStartDate,
        endTime: { hour: eventStartTime.hour + 1, minute: eventStartTime.minute },
        color: "blue",
        user: users[0]?.id || "",
      });

      toast.success("Event created successfully!");
      setTitle("");
      onClose();
    } catch (error) {
      toast.error("Failed to create event");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleQuickAdd();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Add Event</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Event title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleQuickAdd} disabled={isLoading || !title.trim()}>
              <Plus className="size-4" />
              {isLoading ? "Creating..." : "Add Event"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}