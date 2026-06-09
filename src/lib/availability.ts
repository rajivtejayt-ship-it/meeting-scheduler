export function getAvailableSlots(
  date: Date,
  workingHours: { start: string; end: string; isActive: boolean },
  duration: number,
  events: any[]
) {
  console.log("  [getAvailableSlots] Input date:", date.toISOString());
  console.log("  [getAvailableSlots] Working hours:", workingHours);
  console.log("  [getAvailableSlots] Duration:", duration);
  console.log("  [getAvailableSlots] Events count:", events.length);

  if (!workingHours.isActive) {
    console.log("  [getAvailableSlots] Working hours not active, returning empty");
    return [];
  }

  const slots: Date[] = [];
  const [startHour, startMin] = workingHours.start.split(":").map(Number);
  const [endHour, endMin] = workingHours.end.split(":").map(Number);

  console.log("  [getAvailableSlots] Parsed hours - start:", startHour, startMin, "end:", endHour, endMin);

  // Always build slot times in UTC using the UTC date components of `date`.
  // The caller passes a date whose UTC Y/M/D matches the user-selected calendar
  // date (see getAvailableSlotsAction which constructs a UTC-midnight date from
  // the YYYY-MM-DD string sent by the client).
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  console.log("  [getAvailableSlots] UTC components:", { year, month, day });

  const startOfWindow = new Date(Date.UTC(year, month, day, startHour, startMin, 0, 0));
  const endOfWindow   = new Date(Date.UTC(year, month, day, endHour,   endMin,   0, 0));

  console.log("  [getAvailableSlots] Window start:", startOfWindow.toISOString());
  console.log("  [getAvailableSlots] Window end:", endOfWindow.toISOString());

  let currentSlot = new Date(startOfWindow);
  let slotCount = 0;

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
      slotCount++;
    }

    currentSlot = new Date(currentSlot.getTime() + duration * 60 * 1000);
  }

  console.log("  [getAvailableSlots] Total slots generated:", slotCount);
  return slots;
}
