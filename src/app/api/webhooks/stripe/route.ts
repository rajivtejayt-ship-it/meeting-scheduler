import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { bookings, meetingTypes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createCalendarEvent } from "@/lib/google-calendar";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const bookingId = session.metadata.bookingId;

    // 1. Update booking status
    const [booking] = await db
      .update(bookings)
      .set({ paymentStatus: "paid", stripeSessionId: session.id })
      .where(eq(bookings.id, bookingId))
      .returning();

    // 2. Fetch meeting type and user details
    const meetingType = await db.query.meetingTypes.findFirst({
      where: eq(meetingTypes.id, booking.meetingTypeId),
      with: {
        user: true
      }
    });

    if (meetingType) {
      // 3. Create Google Calendar Event
      const googleEvent = await createCalendarEvent(meetingType.userId, {
        title: `${meetingType.name} with ${booking.guestName}`,
        description: meetingType.description || "",
        startTime: booking.startTime,
        endTime: booking.endTime,
        guestEmail: booking.guestEmail,
        guestName: booking.guestName,
      });

      // 4. Update booking with Google Event ID
      await db
        .update(bookings)
        .set({ googleEventId: googleEvent.id })
        .where(eq(bookings.id, booking.id));
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
