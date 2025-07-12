import type { Event } from "@/app/EventCalendar";

export interface EventFormProps {
  event: Event | null;
  onSave: (event: Omit<Event, "id">) => void;
  onDelete?: () => void;
  onClose: () => void;
  selectedDate: Date | undefined;
  checkConflicts: (event: Event) => Event[];
}
