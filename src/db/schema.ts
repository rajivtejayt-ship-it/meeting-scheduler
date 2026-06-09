import { pgTable, text, uuid, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk ID
  email: text("email").notNull().unique(),
  name: text("name"),
  googleAccessToken: text("google_access_token"),
  googleRefreshToken: text("google_refresh_token"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  meetingTypes: many(meetingTypes),
}));

export const meetingTypes = pgTable("meeting_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // in minutes
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const meetingTypesRelations = relations(meetingTypes, ({ one, many }) => ({
  user: one(users, {
    fields: [meetingTypes.userId],
    references: [users.id],
  }),
  bookings: many(bookings),
}));

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  meetingTypeId: uuid("meeting_type_id").notNull().references(() => meetingTypes.id, { onDelete: "cascade" }),
  guestName: text("guest_name").notNull(),
  guestEmail: text("guest_email").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  googleEventId: text("google_event_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookingsRelations = relations(bookings, ({ one }) => ({
  meetingType: one(meetingTypes, {
    fields: [bookings.meetingTypeId],
    references: [meetingTypes.id],
  }),
}));
