"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { meetingTypes } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function createMeetingType(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const duration = parseInt(formData.get("duration") as string);
  const price = parseInt(formData.get("price") as string) || 0;

  await db.insert(meetingTypes).values({
    userId,
    name,
    description,
    duration,
    price,
  });

  revalidatePath("/dashboard");
}

export async function getMeetingTypes() {
  const { userId } = await auth();
  if (!userId) return [];

  return await db.query.meetingTypes.findMany({
    where: (mt, { eq }) => eq(mt.userId, userId),
    orderBy: (mt, { desc }) => [desc(mt.createdAt)],
  });
}
