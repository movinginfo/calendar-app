import { useEvents } from "@/calendar/hooks/use-events";

import type { IEvent } from "@/calendar/interfaces";

export function useUpdateEvent() {
  const { updateEvent: updateEventHook } = useEvents();

  // This maintains backward compatibility with the existing drag and drop functionality
  const updateEvent = (event: IEvent) => {
    updateEventHook(event.id, {
      startDate: event.startDate,
      endDate: event.endDate,
    });
  };

  return { updateEvent };
}