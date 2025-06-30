"use client";

import { format, parseISO } from "date-fns";
import { Calendar, Clock, Text, User, Edit, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";

import { useEvents } from "@/calendar/hooks/use-events";

import { Button } from "@/components/ui/button";
import { EditEventDialog } from "@/calendar/components/dialogs/edit-event-dialog";
import { DeleteEventDialog } from "@/calendar/components/dialogs/delete-event-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import type { IEvent } from "@/calendar/interfaces";

interface IProps {
  event: IEvent;
  children: React.ReactNode;
}

export function EventDetailsDialog({ event, children }: IProps) {
  const { duplicateEvent, isLoading } = useEvents();

  const startDate = parseISO(event.startDate);
  const endDate = parseISO(event.endDate);

  const handleDuplicate = async () => {
    try {
      await duplicateEvent(event.id);
      toast.success("Event duplicated successfully!");
    } catch (error) {
      toast.error("Failed to duplicate event");
    }
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-start justify-between">
              <span className="pr-8">{event.title}</span>
              <div 
                className={`size-3 rounded-full shrink-0 mt-1 ${
                  event.color === 'blue' ? 'bg-blue-600' :
                  event.color === 'green' ? 'bg-green-600' :
                  event.color === 'red' ? 'bg-red-600' :
                  event.color === 'yellow' ? 'bg-yellow-600' :
                  event.color === 'purple' ? 'bg-purple-600' :
                  event.color === 'orange' ? 'bg-orange-600' :
                  'bg-neutral-600'
                }`}
              />
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="mt-1 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Responsible</p>
                <p className="text-sm text-muted-foreground">{event.user.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="mt-1 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Start Date</p>
                <p className="text-sm text-muted-foreground">{format(startDate, "MMM d, yyyy h:mm a")}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="mt-1 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">End Date</p>
                <p className="text-sm text-muted-foreground">{format(endDate, "MMM d, yyyy h:mm a")}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Text className="mt-1 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Description</p>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDuplicate}
                disabled={isLoading}
              >
                <Copy className="size-4" />
                {isLoading ? "Duplicating..." : "Duplicate"}
              </Button>

              <EditEventDialog event={event}>
                <Button variant="outline" size="sm">
                  <Edit className="size-4" />
                  Edit
                </Button>
              </EditEventDialog>

              <DeleteEventDialog event={event}>
                <Button variant="destructive" size="sm">
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </DeleteEventDialog>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}