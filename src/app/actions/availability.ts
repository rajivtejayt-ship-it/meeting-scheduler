"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { availability } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getAvailability() {
  const { userId } = await auth();
  if (!userId) return [];

  const userAvailability = await db.query.availability.findMany({
    where: eq(availability.userId, userId),
    orderBy: (a, { asc }) => [asc(a.dayOfWeek)],
  });

  // If no availability is set, initialize with defaults
  if (userAvailability.length === 0) {
    const defaults = Array.from({ length: 7 }, (_, i) => ({
      userId,
      dayOfWeek: i,
      startTime: "09:00",
      endTime: "17:00",
      isActive: i !== 0 && i !== 6, // Active Monday-Friday
    }));

    await db.insert(availability).values(defaults);
    return defaults;
  }

  return userAvailability;
}

export async function updateAvailability(data: {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}[]) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  for (const day of data) {
    if (day.id) {
      await db
        .update(availability)
        .set({
          startTime: day.startTime,
          endTime: day.endTime,
          isActive: day.isActive,
        })
        .where(and(eq(availability.id, day.id), eq(availability.userId, userId)));
    } else {
      await db.insert(availability).values({
        userId,
        dayOfWeek: day.dayOfWeek,
        startTime: day.startTime,
        endTime: day.endTime,
        isActive: day.isActive,
      });
    }
  }

  revalidatePath("/dashboard/availability");
}
