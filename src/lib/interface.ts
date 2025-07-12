export interface EventFormProps {
  event: Event | null;
  onSave: (event: Omit<Event, "id">) => void;
  onDelete?: () => void;
  onClose: () => void;
  selectedDate: Date | undefined;
  checkConflicts: (event: Event) => Event[];
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  recurrence: "none" | "daily" | "weekly" | "monthly" | "custom";
  customRecurrence?: {
    interval: number;
    unit: "days" | "weeks" | "months";
  };
  color: string;
  category?: string;
  endDate?: string;
}
