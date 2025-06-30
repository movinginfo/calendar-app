import { useCallback } from "react";
import { useEvents } from "@/calendar/hooks/use-events";
import { useCalendar } from "@/calendar/contexts/calendar-context";

import type { TEventFormData } from "@/calendar/schemas";

export function useAddEvent() {
  const { users } = useCalendar();
  const { createEvent, isLoading } = useEvents();

  const addEvent = useCallback(async (formData: TEventFormData) => {
    const user = users.find(user => user.id === formData.user);
    
    if (!user) {
      throw new Error("User not found");
    }

    const startDateTime = new Date(formData.startDate);
    startDateTime.setHours(formData.startTime.hour, formData.startTime.minute, 0, 0);

    const endDateTime = new Date(formData.endDate);
    endDateTime.setHours(formData.endTime.hour, formData.endTime.minute, 0, 0);

    // Validate that end time is after start time
    if (endDateTime <= startDateTime) {
      throw new Error("End time must be after start time");
    }

    const eventData = {
      title: formData.title,
      description: formData.description,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      color: formData.color,
      user,
    };

    return await createEvent(eventData);
  }, [users, createEvent]);

  return {
    addEvent,
    isLoading,
  };
}