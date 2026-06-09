"use server";

import { db } from "@/db";
import { meetingTypes, bookings, availability } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCalendarEvents, createCalendarEvent } from "@/lib/google-calendar";
import { getAvailableSlots } from "@/lib/availability";
import { revalidatePath } from "next/cache";

export async function getHostAvailabilityAction(meetingTypeId: string): Promise<number[]> {
  const meetingType = await db.query.meetingTypes.findFirst({
    where: eq(meetingTypes.id, meetingTypeId),
  });

  if (!meetingType) return [];

  const hostAvailability = await db.query.availability.findMany({
    where: eq(availability.userId, meetingType.userId),
  });

  return hostAvailability
    .filter((a) => a.isActive)
    .map((a) => a.dayOfWeek);
}

export async function getAvailableSlotsAction(meetingTypeId: string, date: Date) {
  const meetingType = await db.query.meetingTypes.findFirst({
    where: eq(meetingTypes.id, meetingTypeId),
  });

  if (!meetingType) throw new Error("Meeting type not found");

  // Use local day-of-week from the date string, not UTC, so that a visitor
  // picking "Monday" always looks up Monday availability regardless of timezone.
  const localDate = new Date(date);
  const dayOfWeek = localDate.getDay();

  const hostAvailability = await db.query.availability.findFirst({
    where: and(
      eq(availability.userId, meetingType.userId),
      eq(availability.dayOfWeek, dayOfWeek)
    ),
  });

  if (!hostAvailability || !hostAvailability.isActive) return [];

  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const events = await getCalendarEvents(meetingType.userId, startOfDay, endOfDay);
  
  const slots = getAvailableSlots(
    date, 
    { 
      start: hostAvailability.startTime, 
      end: hostAvailability.endTime, 
      isActive: hostAvailability.isActive 
    }, 
    meetingType.duration, 
    events
  );

  return slots.map(s => s.toISOString());
}

import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// ... existing code

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

  // 1. If paid meeting, create pending booking and Stripe session
  if (meetingType.price > 0) {
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === "sk_test_placeholder") {
      throw new Error("Payments are not yet configured for this site. Please book a free meeting or contact the host.");
    }

    const origin = (await headers()).get("origin");

    // Create a pending booking
    const [newBooking] = await db.insert(bookings).values({
      meetingTypeId,
      guestName,
      guestEmail,
      startTime,
      endTime,
      paymentStatus: "pending",
    }).returning();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: meetingType.currency,
            product_data: {
              name: `${meetingType.name} with ${guestName}`,
              description: meetingType.description || "",
            },
            unit_amount: meetingType.price,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/booking/${meetingTypeId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/booking/${meetingTypeId}/confirm?slot=${slot}`,
      customer_email: guestEmail,
      metadata: {
        bookingId: newBooking.id,
        meetingTypeId: meetingType.id,
      },
    });

    if (session.url) {
      redirect(session.url);
    }
    throw new Error("Failed to create Stripe session");
  }

  // 2. For free meetings, create Google Calendar Event immediately
  const googleEvent = await createCalendarEvent(meetingType.userId, {
    title: `${meetingType.name} with ${guestName}`,
    description: meetingType.description || "",
    startTime,
    endTime,
    guestEmail,
    guestName,
  });

  // 3. Save to local DB
  await db.insert(bookings).values({
    meetingTypeId,
    guestName,
    guestEmail,
    startTime,
    endTime,
    googleEventId: googleEvent.id || null,
    paymentStatus: "paid",
  });

  revalidatePath("/dashboard");
}
