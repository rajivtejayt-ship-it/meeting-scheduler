"use server";

import { db } from "@/db";
import { meetingTypes, bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCalendarEvents, createCalendarEvent } from "@/lib/google-calendar";
import { getAvailableSlots } from "@/lib/availability";
import { revalidatePath } from "next/cache";

export async function getAvailableSlotsAction(meetingTypeId: string, date: Date) {
  // ... existing implementation
  const meetingType = await db.query.meetingTypes.findFirst({
    where: eq(meetingTypes.id, meetingTypeId),
  });

  if (!meetingType) throw new Error("Meeting type not found");

  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const events = await getCalendarEvents(meetingType.userId, startOfDay, endOfDay);
  const workingHours = { start: 9, end: 17 };
  const slots = getAvailableSlots(date, workingHours, meetingType.duration, events);

  return slots.map(s => s.toISOString());
}

export async function confirmBooking(formData: FormData) {
  const meetingTypeId = formData.get("meetingTypeId") as string;
  const slot = formData.get("slot") as string;
  const guestName = formData.get("guestName") as string;
  const guestEmail = formData.get("guestEmail") as string;

  const meetingType = await db.query.meetingTypes.findFirst({
    where: eq(meetingTypes.id, meetingTypeId),
  });

  if (!meetingType) throw new Error("Meeting type not found");

  const startTime = new Date(slot);
  const endTime = new Date(startTime.getTime() + meetingType.duration * 60 * 1000);

  // 1. Create Google Calendar Event
  const googleEvent = await createCalendarEvent(meetingType.userId, {
    title: `${meetingType.name} with ${guestName}`,
    description: meetingType.description || "",
    startTime,
    endTime,
    guestEmail,
    guestName,
  });

  // 2. Save to local DB
  await db.insert(bookings).values({
    meetingTypeId,
    guestName,
    guestEmail,
    startTime,
    endTime,
    googleEventId: googleEvent.id || null,
  });

  revalidatePath("/dashboard");
}
