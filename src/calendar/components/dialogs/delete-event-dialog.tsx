"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useDisclosure } from "@/hooks/use-disclosure";
import { useEvents } from "@/calendar/hooks/use-events";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import type { IEvent } from "@/calendar/interfaces";

interface IProps {
  event: IEvent;
  children?: React.ReactNode;
}

export function DeleteEventDialog({ event, children }: IProps) {
  const { isOpen, onClose, onToggle } = useDisclosure();
  const { deleteEvent, isLoading } = useEvents();

  const handleDelete = async () => {
    try {
      await deleteEvent(event.id);
      toast.success("Event deleted successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to delete event");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="destructive" size="sm">
            <Trash2 className="size-4" />
            Delete
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Event</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{event.title}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}