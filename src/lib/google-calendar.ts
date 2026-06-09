import { google } from "googleapis";
import { clerkClient } from "@clerk/nextjs/server";

export async function getGoogleCalendarClient(userId: string) {
  const client = await clerkClient();
  const tokenResponse = await client.users.getUserOauthAccessToken(userId, 'oauth_google');
  
  const token = tokenResponse.data[0]?.token;
  
  if (!token) {
    throw new Error("No Google OAuth token found for user");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({ access_token: token });

  return google.calendar({ version: "v3", auth: oauth2Client });
}

export async function getCalendarEvents(userId: string, start: Date, end: Date) {
  const calendar = await getGoogleCalendarClient(userId);
  
  const response = await calendar.events.list({
    calendarId: "primary",
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
  });

  return response.data.items || [];
}

export async function createCalendarEvent(
  userId: string,
  event: {
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    guestEmail: string;
    guestName: string;
  }
) {
  const calendar = await getGoogleCalendarClient(userId);

  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: event.title,
      description: event.description,
      start: { dateTime: event.startTime.toISOString() },
      end: { dateTime: event.endTime.toISOString() },
      attendees: [{ email: event.guestEmail, displayName: event.guestName }],
    },
  });

  return response.data;
}
