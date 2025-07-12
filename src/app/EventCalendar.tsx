import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Funnel, Menu, Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const [currentMonth, setCurrentMonth] = useState(new Date());

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
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1)
    );
  };

  return (
    <div className="flex h-screen w-full">
      <div className="w-2/9 bg-white px-8 py-4 rounded shadow flex flex-col">
        <Tabs defaultValue="month" className="w-full">
          <div className="border-b border-gray-200 mb-2">
            <TabsList className="flex bg-slate-100 rounded-lg p-1 mb-4 w-full">
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </div>
          <div className="ml-1">
            <TabsContent value="day">
              <Calendar mode="single" className="bg-slate-100 rounded-lg" />
            </TabsContent>
            <TabsContent value="week">
              <Calendar mode="single" className="bg-slate-100 rounded-lg" />
            </TabsContent>
            <TabsContent value="month">
              <Calendar mode="single" className="bg-slate-100 rounded-lg" />
            </TabsContent>
          </div>
        </Tabs>
      </div>
      <div className="w-7/9 bg-white px-6 rounded shadow overflow-y-auto flex flex-col">
        <div className="sticky top-0 bg-white z-10 flex pt-4 items-center justify-between w-full pb-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-700">
            {format(currentMonth, "MMMM yyyy")}
          </h1>
          <div className="flex items-center gap-3">
            <Button onClick={goToPrevMonth} variant="outline" size="sm">
              ←
            </Button>
            <Button
              onClick={() => setCurrentMonth(new Date())}
              variant="outline"
              className="px-5 py-2"
            >
              Today
            </Button>
            <Button onClick={goToNextMonth} variant="outline" size="sm">
              →
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
        <div className="grid grid-cols-7 gap-px mt-2 mb-2 bg-gray-200 text-gray-600 text-sm font-semibold border">
          {daysOfWeek.map((day) => (
            <div key={day} className="py-3 bg-slate-100 px-auto text-center">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200 text-sm text-gray-700 border mb-4">
          {calendarDays.map((date, idx) => {
            const isCurrentMonth = isSameMonth(date, currentMonth);

            return (
              <div
                key={idx}
                className={`bg-white h-[120px] p-2 text-left relative ${
                  !isCurrentMonth ? "bg-gray-50 text-gray-400" : ""
                } hover:bg-slate-50`}
              >
                <span className="font-semibold text-xs">
                  {format(date, "d")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default EventCalendar;
