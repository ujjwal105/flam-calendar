import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Funnel, Menu, Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

function EventCalendar() {
  return (
    <div className="flex">
      <div className="w-2/9 bg-white p-8 rounded shadow flex flex-col">
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
      <div className="w-7/9 bg-white px-6 py-4 rounded shadow h-[80vh] overflow-y-auto flex flex-col">
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between w-full py-4 border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-700">August 2025</h1>
          <div className="flex items-center gap-3">
            <Button variant={"outline"} className="px-5 py-2">
              Today
            </Button>
            <div className="border-r h-8 border border-gray-200" />
            <Button variant={"outline"}>
              <Funnel />
            </Button>
            <Button variant={"outline"}>
              <Menu />
            </Button>
            <Button className="px-6 py-2 bg-blue-500 text-white hover:bg-blue-600">
              <Plus /> Add Schedule
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventCalendar;
