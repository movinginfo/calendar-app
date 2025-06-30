import { useCallback, useState } from "react";
import { useCalendar } from "@/calendar/contexts/calendar-context";

import type { IEvent, IUser } from "@/calendar/interfaces";
import type { TEventColor } from "@/calendar/types";

interface CreateEventData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  color: TEventColor;
  user: IUser;
}

interface UpdateEventData {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  color?: TEventColor;
  user?: IUser;
}

export function useEvents() {
  const { setLocalEvents } = useCalendar();
  const [isLoading, setIsLoading] = useState(false);

  const createEvent = useCallback(
    async (eventData: CreateEventData) => {
      setIsLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const newEvent: IEvent = {
          ...eventData,
          id: Date.now(), // Simple ID generation for demo
        };

        setLocalEvents(prev => [...prev, newEvent]);
        return newEvent;
      } finally {
        setIsLoading(false);
      }
    },
    [setLocalEvents]
  );

  const updateEvent = useCallback(
    async (eventId: number, updates: UpdateEventData) => {
      setIsLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        setLocalEvents(prev => {
          const index = prev.findIndex(e => e.id === eventId);
          if (index === -1) return prev;
          
          const updatedEvent = { ...prev[index], ...updates };
          return [...prev.slice(0, index), updatedEvent, ...prev.slice(index + 1)];
        });
      } finally {
        setIsLoading(false);
      }
    },
    [setLocalEvents]
  );

  const deleteEvent = useCallback(
    async (eventId: number) => {
      setIsLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        setLocalEvents(prev => prev.filter(e => e.id !== eventId));
      } finally {
        setIsLoading(false);
      }
    },
    [setLocalEvents]
  );

  const duplicateEvent = useCallback(
    async (eventId: number) => {
      setIsLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        setLocalEvents(prev => {
          const originalEvent = prev.find(e => e.id === eventId);
          if (!originalEvent) return prev;

          const duplicatedEvent: IEvent = {
            ...originalEvent,
            id: Date.now(), // Simple ID generation for demo
            title: `${originalEvent.title} (Copy)`,
          };

          return [...prev, duplicatedEvent];
        });
      } finally {
        setIsLoading(false);
      }
    },
    [setLocalEvents]
  );

  return {
    createEvent,
    updateEvent,
    deleteEvent,
    duplicateEvent,
    isLoading,
  };
}