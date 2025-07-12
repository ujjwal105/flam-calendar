import { z } from "zod";

export type EventFormValues = z.infer<typeof eventFormSchema>;

export const eventFormSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  description: z.string().optional(),
  recurrence: z.enum(["none", "daily", "weekly", "monthly", "custom"]),
  customRecurrence: z
    .object({
      interval: z.number().min(1),
      unit: z.enum(["days", "weeks", "months"]),
    })
    .optional(),
  color: z.string(),
  category: z.string(),
  endDate: z.string().optional(),
});
