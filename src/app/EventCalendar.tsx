import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  ChevronLeft,
  ChevronRight,
  FilterIcon as Funnel,
  Menu,
  Plus,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  format,
} from "date-fns";

function EventCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [activeTab, setActiveTab] = useState("month");

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

  const EVENTS = {};

  return (
    <div className="flex h-screen w-full">
      <div className="w-2/9 bg-white px-8 py-4 rounded shadow flex flex-col">
        <Tabs
          defaultValue="month"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <div className="border-b border-gray-200 mb-2">
            <TabsList className="flex bg-slate-100 rounded-sm p-1 mb-4 w-full">
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
              className="bg-slate-100 rounded-sm"
            />
          </div>
        </Tabs>
      </div>
      <div className="w-7/9 bg-white px-6 rounded shadow overflow-y-auto flex flex-col">
        <div className="sticky top-0 bg-white z-10 flex pt-4 items-center justify-between w-full pb-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-700">
            {activeTab === "day" && selectedDate
              ? format(selectedDate, "MMMM dd, yyyy")
              : activeTab === "week" && selectedDate
              ? `${format(startOfWeek(selectedDate), "MMM dd")} - ${format(
                  endOfWeek(selectedDate),
                  "MMM dd, yyyy"
                )}`
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
            <div className="border-r h-6 border border-gray-300" />
            <Button variant="outline">
              <Funnel size={18} />
            </Button>
            <Button variant="outline">
              <Menu size={18} />
            </Button>
            <Button className="px-6 py-2 bg-blue-500 text-white hover:bg-blue-600">
              <Plus className="mr-2 h-4 w-4" /> Add Schedule
            </Button>
          </div>
        </div>
        {activeTab === "month" && (
          <MonthView
            currentMonth={currentMonth}
            calendarDays={calendarDays}
            EVENTS={EVENTS}
          />
        )}
        {activeTab === "day" && selectedDate && (
          <DayView selectedDate={selectedDate} EVENTS={EVENTS} />
        )}
        {activeTab === "week" && selectedDate && (
          <WeekView startDate={startOfWeek(selectedDate)} EVENTS={EVENTS} />
        )}
      </div>
    </div>
  );
}

export default EventCalendar;

export const MonthView = ({ currentMonth, calendarDays, EVENTS }: any) => {
  return (
    <div>
      <div className="grid grid-cols-7 gap-px mt-2 mb-2 bg-gray-200 text-gray-600 text-sm font-semibold border">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-3 bg-slate-100 px-auto text-center">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-gray-200 text-sm text-gray-700 border mb-4">
        {calendarDays.map((date: any, idx: any) => {
          const dateStr = format(date, "yyyy-MM-dd");
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const event = EVENTS[dateStr];
          return (
            <div
              key={idx}
              className={`bg-white h-[120px] p-2 text-left relative ${
                !isCurrentMonth ? "bg-gray-50 text-gray-400" : ""
              } hover:bg-slate-50`}
            >
              <span className="font-semibold text-xs">{format(date, "d")}</span>
              {event && (
                <div
                  className={`mt-2 px-2 py-1 rounded text-xs font-medium w-fit ${event.color}`}
                >
                  {event.title}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const DayView = ({ selectedDate, EVENTS }: any) => {
  const formattedDate = format(selectedDate, "yyyy-MM-dd");
  const eventsForSelectedDay = Object.entries(EVENTS)
    .filter(([dateKey]) => dateKey === formattedDate)
    .map(([, event]) => event);

  const hours = Array.from(
    { length: 24 },
    (_, i) => `${i.toString().padStart(2, "0")}:00`
  );

  return (
    <div className="pt-4">
      <div className="grid grid-rows-24 gap-px bg-gray-200">
        {hours.map((time, i) => (
          <div key={i} className="flex bg-white px-4 py-3 items-start">
            <div className="w-20 text-gray-400 text-sm">{time}</div>
            <div className="flex-1">
              {i === 0 &&
                eventsForSelectedDay.map((event: any, idx: any) => (
                  <div
                    key={idx}
                    className="bg-blue-100 text-blue-800 p-2 rounded text-sm mb-1"
                  >
                    <div className="font-semibold">{event.title}</div>
                    <div className="text-xs">Event details here...</div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const WeekView = ({ startDate, EVENTS }: any) => {
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(startDate, i);
    return d;
  });

  const hours = Array.from(
    { length: 24 },
    (_, i) => `${i.toString().padStart(2, "0")}:00`
  );

  return (
    <div className="pt-4">
      <div className="grid grid-cols-8 text-sm font-semibold text-center text-gray-600">
        <div className="bg-white py-2" />
        {weekDays.map((day, idx) => (
          <div key={idx} className="bg-white py-2">
            {format(day, "EEE dd")}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-8 gap-px bg-gray-200">
        {hours.map((hour, i) => (
          <div key={hour} className="contents">
            {" "}
            <div className="bg-white text-sm text-gray-400 py-3 px-2">
              {hour}
            </div>
            {weekDays.map((day, idx) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const event = EVENTS[dateStr];
              return (
                <div
                  key={`${i}-${idx}`}
                  className="bg-white h-[60px] px-2 py-1 relative hover:bg-slate-50"
                >
                  {i === 0 && event && (
                    <div
                      className={`absolute top-0 left-1 right-1 px-2 py-1 rounded text-xs font-medium w-fit ${event.color}`}
                    >
                      {event.title}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
