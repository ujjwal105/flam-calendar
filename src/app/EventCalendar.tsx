import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeft, ChevronRight, FilterIcon as Funnel, Menu, Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
  format,
  parseISO,
  addWeeks,
  addMonths,
  isBefore,
} from "date-fns";
import { EventForm } from "@/components/elements/EventForm";
import { DayView, MonthView, WeekView } from "@/components/elements/CalendarView";

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

function EventCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("month");
  const [events, setEvents] = useState<Event[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);

  useEffect(() => {
    const savedEvents = localStorage.getItem("calendar-events");
    if (savedEvents) {
      const parsedEvents = JSON.parse(savedEvents);
      if (Array.isArray(parsedEvents) && parsedEvents.length > 0) {
        setEvents(parsedEvents);
      }
    }
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem("calendar-events", JSON.stringify(events));
    }
  }, [events]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = [];
  let day = startDate;
  while (day <= endDate) {
    calendarDays.push(day);
    day = addDays(day, 1);
  }

  const goToPrevMonth = () => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev.getFullYear(), prev.getMonth() - 1);
      setSelectedDate(startOfMonth(newMonth));
      return newMonth;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev.getFullYear(), prev.getMonth() + 1);
      setSelectedDate(startOfMonth(newMonth));
      return newMonth;
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setCurrentMonth(date);
    }
  };

  const generateRecurringEvents = (baseEvent: Event): Event[] => {
    if (baseEvent.recurrence === "none") return [baseEvent];

    const recurringEvents: Event[] = [baseEvent];
    const startDate = parseISO(baseEvent.date);
    const endDate = baseEvent.endDate ? parseISO(baseEvent.endDate) : addMonths(startDate, 12);

    let currentDate = startDate;

    while (isBefore(currentDate, endDate)) {
      let nextDate: Date;

      switch (baseEvent.recurrence) {
        case "daily":
          nextDate = addDays(currentDate, 1);
          break;
        case "weekly":
          nextDate = addWeeks(currentDate, 1);
          break;
        case "monthly":
          nextDate = addMonths(currentDate, 1);
          break;
        case "custom":
          if (baseEvent.customRecurrence) {
            const { interval, unit } = baseEvent.customRecurrence;
            switch (unit) {
              case "days":
                nextDate = addDays(currentDate, interval);
                break;
              case "weeks":
                nextDate = addWeeks(currentDate, interval);
                break;
              case "months":
                nextDate = addMonths(currentDate, interval);
                break;
              default:
                nextDate = addDays(currentDate, 1);
            }
          } else {
            nextDate = addDays(currentDate, 1);
          }
          break;
        default:
          nextDate = addDays(currentDate, 1);
      }

      if (isBefore(nextDate, endDate)) {
        recurringEvents.push({
          ...baseEvent,
          id: `${baseEvent.id}-${format(nextDate, "yyyy-MM-dd")}`,
          date: format(nextDate, "yyyy-MM-dd"),
        });
      }

      currentDate = nextDate;
    }

    return recurringEvents;
  };

  const getAllEvents = (): Event[] => {
    const allEvents: Event[] = [];

    events.forEach((event) => {
      const recurringEvents = generateRecurringEvents(event);
      allEvents.push(...recurringEvents);
    });

    return allEvents;
  };

  const getEventsForDate = (date: string): Event[] => {
    return getAllEvents().filter((event) => event.date === date);
  };

  const getFilteredEvents = (): Event[] => {
    let filteredEvents = getAllEvents();

    if (searchTerm) {
      filteredEvents = filteredEvents.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (filterCategory !== "all") {
      filteredEvents = filteredEvents.filter((event) => event.category === filterCategory);
    }

    return filteredEvents;
  };

  const addEvent = (eventData: Omit<Event, "id">) => {
    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString(),
    };

    setEvents((prev) => [...prev, newEvent]);
    setShowEventForm(false);
  };

  const updateEvent = (eventId: string, eventData: Partial<Event>) => {
    setEvents((prev) => prev.map((event) => (event.id === eventId ? { ...event, ...eventData } : event)));
    setEditingEvent(null);
    setShowEventForm(false);
  };

  // delete the schedule event
  const deleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== eventId));
    setEditingEvent(null);
    setShowEventForm(false);
  };

  const handleDragStart = (e: Event) => {
    setDraggedEvent(e);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    if (draggedEvent) {
      const baseEventId = draggedEvent.id.split("-")[0];
      updateEvent(baseEventId, { date: targetDate });
      setDraggedEvent(null);
    }
  };

  const checkEventConflicts = (newEvent: Event): Event[] => {
    const existingEvents = getEventsForDate(newEvent.date);
    return existingEvents.filter((event) => event.id !== newEvent.id && event.time === newEvent.time);
  };

  return (
    <div className="flex h-screen w-full gap-2">
      <div className="w-2/9 bg-white px-8 py-4 rounded shadow flex flex-col">
        <Tabs defaultValue="month" className="w-full" onValueChange={setActiveTab}>
          <div className="border-b border-gray-200 mb-2">
            <TabsList className="flex bg-slate-50 rounded-sm p-1 mb-4 w-full">
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </div>
          <div className="ml-1">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="bg-slate-50 rounded-sm"
            />
          </div>
        </Tabs>
      </div>
      <div className="w-7/9 bg-white rounded overflow-y-auto flex flex-col">
        <div className="sticky top-0 bg-white z-10 px-4 flex pt-4 items-center justify-between w-full pb-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-700">
            {activeTab === "day" && selectedDate
              ? format(selectedDate, "MMMM dd, yyyy")
              : activeTab === "week" && selectedDate
              ? `${format(startOfWeek(selectedDate), "MMM dd")} - ${format(endOfWeek(selectedDate), "MMM dd, yyyy")}`
              : format(currentMonth, "MMMM yyyy")}
          </h1>
          <div className="flex items-center gap-3">
            <Button onClick={goToPrevMonth} variant="outline" size="sm">
              <ChevronLeft />
            </Button>
            <Button
              onClick={() => {
                const today = new Date();
                setCurrentMonth(today);
                setSelectedDate(today);
              }}
              variant="outline"
              className="px-5 py-2"
            >
              Today
            </Button>
            <Button onClick={goToNextMonth} variant="outline" size="sm">
              <ChevronRight />
            </Button>
            <div className="border-r h-8 border border-gray-300" />
            <Button variant="outline">
              <Funnel />
            </Button>
            <Button variant="outline">
              <Menu />
            </Button>
            <Button
              onClick={() => setShowEventForm(true)}
              className="px-6 py-2 bg-[#b9fa00] text-black hover:bg-[#d4ff65] cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Schedule
            </Button>
          </div>
        </div>
        {activeTab === "month" && (
          <MonthView
            currentMonth={currentMonth}
            calendarDays={calendarDays}
            events={getFilteredEvents()}
            onEventClick={(event) => {
              setEditingEvent(event);
              setShowEventForm(true);
            }}
            onDateClick={(date) => {
              setSelectedDate(date);
              setShowEventForm(true);
            }}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        )}
        {activeTab === "day" && selectedDate && (
          <DayView
            selectedDate={selectedDate}
            events={getFilteredEvents()}
            onEventClick={(event) => {
              setEditingEvent(event);
              setShowEventForm(true);
            }}
          />
        )}
        {activeTab === "week" && selectedDate && (
          <WeekView
            startDate={startOfWeek(selectedDate)}
            events={getFilteredEvents()}
            onEventClick={(event) => {
              setEditingEvent(event);
              setShowEventForm(true);
            }}
          />
        )}
      </div>
      {showEventForm && (
        <EventForm
          event={editingEvent}
          onSave={editingEvent ? (eventData) => updateEvent(editingEvent.id, eventData) : addEvent}
          onDelete={editingEvent ? () => deleteEvent(editingEvent.id) : undefined}
          onClose={() => {
            setShowEventForm(false);
            setEditingEvent(null);
          }}
          selectedDate={selectedDate}
          checkConflicts={checkEventConflicts}
        />
      )}
    </div>
  );
}

export default EventCalendar;
