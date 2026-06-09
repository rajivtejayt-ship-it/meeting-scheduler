"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAvailableSlotsAction } from "@/app/actions/booking";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function BookingCalendar({ meetingTypeId }: { meetingTypeId: string }) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [slots, setSlots] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

  useEffect(() => {
    if (date) {
      fetchSlots(date);
    }
  }, [date]);

  async function fetchSlots(selectedDate: Date) {
    setLoading(true);
    setSlots([]);
    setSelectedSlot(null);
    try {
      const availableSlots = await getAvailableSlotsAction(meetingTypeId, selectedDate);
      setSlots(availableSlots.map(s => new Date(s)));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Select a Date</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border shadow"
            disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {date ? format(date, "EEEE, MMMM do") : "Select a date"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : slots.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {slots.map((slot) => (
                <Button
                  key={slot.toISOString()}
                  variant={selectedSlot?.getTime() === slot.getTime() ? "default" : "outline"}
                  onClick={() => setSelectedSlot(slot)}
                >
                  {format(slot, "h:mm a")}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-center py-10 text-gray-500">
              {date ? "No availability for this date." : "Please select a date on the calendar."}
            </p>
          )}

          {selectedSlot && (
            <Link 
              href={`/booking/${meetingTypeId}/confirm?slot=${selectedSlot.toISOString()}`}
              className={cn(buttonVariants({ variant: "default" }), "w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white")}
            >
              Confirm Booking
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
