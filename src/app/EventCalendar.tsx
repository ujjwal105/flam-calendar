import { Button } from "@/components/ui/button";
import type React from "react";

import { Calendar } from "@/components/ui/calendar";
import { ChevronLeft, ChevronRight, FilterIcon as Funnel, Plus, Search } from "lucide-react";
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
  subDays,
  subWeeks,
  subMonths,
} from "date-fns";
import { EventForm } from "@/components/elements/EventForm";
import { DayView, MonthView, WeekView } from "@/components/elements/CalendarView";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { Event } from "@/lib/interface";

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

  const goToPrev = () => {
    if (activeTab === "day" && selectedDate) {
      const newDate = subDays(selectedDate, 1);
      setSelectedDate(newDate);
      setCurrentMonth(newDate);
    } else if (activeTab === "week" && selectedDate) {
      const newDate = subWeeks(selectedDate, 1);
      setSelectedDate(newDate);
      setCurrentMonth(newDate);
    } else {
      setCurrentMonth((prev) => {
        const newMonth = subMonths(prev, 1);
        setSelectedDate(startOfMonth(newMonth));
        return newMonth;
      });
    }
  };

  const goToNext = () => {
    if (activeTab === "day" && selectedDate) {
      const newDate = addDays(selectedDate, 1);
      setSelectedDate(newDate);
      setCurrentMonth(newDate);
    } else if (activeTab === "week" && selectedDate) {
      const newDate = addWeeks(selectedDate, 1);
      setSelectedDate(newDate);
      setCurrentMonth(newDate);
    } else {
      setCurrentMonth((prev) => {
        const newMonth = addMonths(prev, 1);
        setSelectedDate(startOfMonth(newMonth));
        return newMonth;
      });
    }
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
    const baseEventId = eventId.includes("-") ? eventId.split("-")[0] : eventId;

    setEvents((prev) =>
      prev.map((event) => {
        if (event.id === baseEventId) {
          return { ...event, ...eventData };
        }
        return event;
      }),
    );
    setEditingEvent(null);
    setShowEventForm(false);
  };

  const deleteEvent = (eventId: string) => {
    const baseEventId = eventId.includes("-") ? eventId.split("-")[0] : eventId;
    setEvents((prev) => prev.filter((event) => event.id !== baseEventId));
    setEditingEvent(null);
    setShowEventForm(false);
  };

  const checkEventConflicts = (newEvent: Event, originalEventId?: string): Event[] => {
    const existingEventsOnDate = getEventsForDate(newEvent.date);
    return existingEventsOnDate.filter((existingEvent) => {
      const isSameTime = existingEvent.time === newEvent.time;
      const isSelf = existingEvent.id === newEvent.id;
      const isOriginalEventBeingEdited = originalEventId && existingEvent.id === originalEventId;

      return isSameTime && !isSelf && !isOriginalEventBeingEdited;
    });
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

  return (
    <div className="flex flex-col lg:flex-row h-screen gap-4 p-4 bg-gray-100">
      <div className="w-full lg:w-80 bg-white py-4 rounded-lg shadow flex-shrink-0">
        <Tabs defaultValue="month" className="w-full flex flex-col items-center" onValueChange={setActiveTab}>
          <div className="border-b border-gray-200 mb-4 w-full px-4">
            <TabsList className="flex bg-slate-50 rounded-md mb-4 w-full max-w-md mx-auto">
              <TabsTrigger value="day" className="flex-1">
                Day
              </TabsTrigger>
              <TabsTrigger value="week" className="flex-1">
                Week
              </TabsTrigger>
              <TabsTrigger value="month" className="flex-1">
                Month
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="w-full px-4 max-w-md mx-auto">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="bg-slate-50 rounded-md w-full"
            />
          </div>
        </Tabs>
      </div>
      <div className="flex-1 min-w-0 bg-white rounded-lg shadow flex flex-col">
        <div className="sticky top-0 bg-white z-10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between w-full border-b border-gray-200 gap-y-3 sm:gap-y-0">
          <h1 className="text-2xl font-bold text-gray-700 text-center sm:text-left">
            {activeTab === "day" && selectedDate
              ? format(selectedDate, "MMMM dd, yyyy")
              : activeTab === "week" && selectedDate
              ? `${format(startOfWeek(selectedDate), "MMM dd")} - ${format(endOfWeek(selectedDate), "MMM dd, yyyy")}`
              : format(currentMonth, "MMMM yyyy")}
          </h1>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-3 gap-y-2">
            <Button onClick={goToPrev} variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => {
                const today = new Date();
                setCurrentMonth(today);
                setSelectedDate(today);
              }}
              variant="outline"
              className="px-4 py-2 text-sm"
            >
              Today
            </Button>
            <Button onClick={goToNext} variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-2 hidden sm:block" />
            <div className="relative w-full sm:w-40">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-2 py-1.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-[120px]">
                {" "}
                {/* Make select responsive */}
                <Funnel className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="holiday">Holiday</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => setShowEventForm(true)}
              className="px-5 py-2 bg-[#b9fa00] text-black hover:bg-[#d4ff65] cursor-pointer text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Schedule
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
            onDateClick={(date) => {
              setSelectedDate(date);
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
            onDateClick={(date) => {
              setSelectedDate(date);
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
