export function getAvailableSlots(
  date: Date,
  workingHours: { start: string; end: string; isActive: boolean },
  duration: number,
  events: any[]
) {
  if (!workingHours.isActive) return [];

  const slots: Date[] = [];
  const [startHour, startMin] = workingHours.start.split(":").map(Number);
  const [endHour, endMin] = workingHours.end.split(":").map(Number);

  // Always build slot times in UTC using the UTC date components of `date`.
  // The caller passes a date whose UTC Y/M/D matches the user-selected calendar
  // date (see getAvailableSlotsAction which constructs a UTC-midnight date from
  // the YYYY-MM-DD string sent by the client).
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  const startOfWindow = new Date(Date.UTC(year, month, day, startHour, startMin, 0, 0));
  const endOfWindow   = new Date(Date.UTC(year, month, day, endHour,   endMin,   0, 0));

  let currentSlot = new Date(startOfWindow);

  while (currentSlot < endOfWindow) {
    const slotEnd = new Date(currentSlot.getTime() + duration * 60 * 1000);

    // Ensure slot doesn't exceed end of window
    if (slotEnd > endOfWindow) break;

    // Check for overlap with existing calendar events
    const hasOverlap = events.some((event) => {
      const eventStart = new Date(event.start.dateTime || event.start.date);
      const eventEnd   = new Date(event.end.dateTime   || event.end.date);
      return currentSlot < eventEnd && slotEnd > eventStart;
    });

    if (!hasOverlap) {
      slots.push(new Date(currentSlot));
    }

    currentSlot = new Date(currentSlot.getTime() + duration * 60 * 1000);
  }

  return slots;
}
