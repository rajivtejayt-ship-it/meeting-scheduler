"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function syncUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!existingUser) {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses[0].emailAddress;

    await db.insert(users).values({
      id: userId,
      email: email,
      name: `${user.firstName} ${user.lastName}`,
    });
  }

  return userId;
}
