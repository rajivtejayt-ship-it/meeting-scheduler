"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAvailableSlotsAction, getHostAvailabilityAction } from "@/app/actions/booking";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { Loader2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function BookingCalendar({ meetingTypeId }: { meetingTypeId: string }) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [slots, setSlots] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [timezone, setTimezone] = useState<string>("UTC");
  const [activeDays, setActiveDays] = useState<number[]>([1, 2, 3, 4, 5]); // defaults Mon-Fri

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  useEffect(() => {
    // Fetch the host's active days so the calendar disables the right days
    getHostAvailabilityAction(meetingTypeId).then((days) => {
      setActiveDays(days);
    }).catch(() => {
      // fallback to Mon-Fri if fetch fails
      setActiveDays([1, 2, 3, 4, 5]);
    });
  }, [meetingTypeId]);

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
      // Send date as a YYYY-MM-DD string in the visitor's local calendar so
      // the server can reconstruct the correct UTC-midnight date without any
      // timezone ambiguity (a raw Date object gets serialized to UTC ISO which
      // shifts the day for visitors in timezones ahead of UTC).
      const year  = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day   = String(selectedDate.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      console.log("[BookingCalendar] Fetching slots for date:", dateString);
      console.log("[BookingCalendar] Selected date object:", selectedDate);
      console.log("[BookingCalendar] Meeting type ID:", meetingTypeId);

      const availableSlots = await getAvailableSlotsAction(meetingTypeId, dateString);
      
      console.log("[BookingCalendar] Received slots:", availableSlots.length);
      setSlots(availableSlots.map(s => new Date(s)));
    } catch (error) {
      console.error("[BookingCalendar] Error fetching slots:", error);
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
            disabled={(d) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return d < today || !activeDays.includes(d.getDay());
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {date ? format(date, "EEEE, MMMM do") : "Select a date"}
            </CardTitle>
            <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              <Globe className="h-3 w-3" />
              {timezone}
            </div>
          </div>
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
                  {formatInTimeZone(slot, timezone, "h:mm a")}
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
