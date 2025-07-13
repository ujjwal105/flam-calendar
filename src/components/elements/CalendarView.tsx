import type { DayViewProps, Event, MonthViewProps, WeekViewProps } from "@/lib/interface";
import { addDays, format, isSameDay, isSameMonth } from "date-fns";

export const MonthView = ({
  currentMonth,
  calendarDays,
  events,
  onEventClick,
  onDateClick,
  onDragStart,
  onDragOver,
  onDrop,
}: MonthViewProps) => {
  const getEventsForDate = (date: Date): Event[] => {
    const dateStr = format(date, "yyyy-MM-dd");
    return events.filter((event) => event.date === dateStr);
  };

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
        {calendarDays.map((date: Date, idx: number) => {
          const dateStr = format(date, "yyyy-MM-dd");
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isToday = isSameDay(date, new Date());
          const dayEvents = getEventsForDate(date);

          return (
            <div
              key={idx}
              className={`bg-white h-[120px] p-2 text-left relative cursor-pointer ${
                !isCurrentMonth ? "bg-gray-50 text-gray-400" : ""
              } ${isToday ? "bg-blue-50" : ""} hover:bg-slate-50`}
              onClick={() => onDateClick(date)}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, dateStr)}
            >
              <span className={`font-semibold text-xs ${isToday ? "text-blue-600" : ""}`}>{format(date, "d")}</span>
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className={`px-2 py-1 rounded text-xs font-medium cursor-pointer ${event.color} truncate`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    draggable
                    onDragStart={() => onDragStart(event)}
                    title={event.title}
                  >
                    {event.time} {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && <div className="text-xs text-gray-500 px-2">+{dayEvents.length - 3} more</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const DayView = ({ selectedDate, events, onEventClick, onDateClick }: DayViewProps) => {
  const formattedDate = format(selectedDate, "yyyy-MM-dd");
  const eventsForSelectedDay = events.filter((event) => event.date === formattedDate);
  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);

  const getEventsForHour = (hour: string) => {
    return eventsForSelectedDay.filter((event) => event.time.startsWith(hour.slice(0, 2)));
  };

  const handleTimeSlotClick = (hour: string) => {
    const [hourNum] = hour.split(":");
    const dateWithTime = new Date(selectedDate);
    dateWithTime.setHours(Number.parseInt(hourNum), 0, 0, 0);
    onDateClick(dateWithTime);
  };

  return (
    <div className="pt-4 pb-4">
      <div className="grid grid-rows-24 gap-px bg-gray-200">
        {hours.map((time, i) => {
          const hourEvents = getEventsForHour(time);
          return (
            <div
              key={i}
              className="flex bg-white px-4 py-3 items-start min-h-14 cursor-pointer"
              onClick={() => handleTimeSlotClick(time)}
            >
              <div className="w-20 text-gray-400 text-sm font-medium">{time}</div>
              <div className="flex-1 space-y-1 p-2 rounded">
                {hourEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`p-2 rounded text-sm cursor-pointer ${event.color}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                  >
                    <div className="font-semibold">{event.title}</div>
                    <div className="text-xs opacity-80">{event.time}</div>
                    {event.description && <div className="text-xs opacity-70 mt-1">{event.description}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const WeekView = ({ startDate, events, onEventClick, onDateClick }: WeekViewProps) => {
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(startDate, i);
    return d;
  });
  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);

  const getEventsForDateAndHour = (date: Date, hour: string) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return events.filter((event) => event.date === dateStr && event.time.startsWith(hour.slice(0, 2)));
  };

  const handleTimeSlotClick = (date: Date, hour: string) => {
    const [hourNum] = hour.split(":");
    const dateWithTime = new Date(date);
    dateWithTime.setHours(Number.parseInt(hourNum), 0, 0, 0);
    onDateClick(dateWithTime);
  };

  return (
    <div className="pt-4 mb-4">
      <div className="grid grid-cols-8 text-sm font-semibold text-center text-gray-600 border-b">
        <div className="bg-white py-2" />
        {weekDays.map((day, idx) => {
          const isToday = isSameDay(day, new Date());
          return (
            <div key={idx} className={`bg-white py-2 ${isToday ? "text-blue-600" : ""}`}>
              {format(day, "EEE dd")}
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-8 gap-px bg-gray-200 border-b border-t">
        {hours.map((hour, i) => (
          <div key={hour} className="contents">
            <div className="bg-white text-sm text-gray-400 py-3 px-2 font-medium">{hour}</div>
            {weekDays.map((day, idx) => {
              const hourEvents = getEventsForDateAndHour(day, hour);
              return (
                <div
                  key={`${i}-${idx}`}
                  className="bg-white h-[60px] px-2 py-1 relative hover:bg-slate-50 border-r border-gray-100 cursor-pointer"
                  onClick={() => handleTimeSlotClick(day, hour)}
                >
                  {hourEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`absolute top-0 left-1 right-1 px-2 py-1 rounded text-xs font-medium cursor-pointer ${event.color} truncate`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      title={`${event.title} - ${event.time}`}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
