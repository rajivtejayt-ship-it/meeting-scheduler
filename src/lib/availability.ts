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

  const startOfDay = new Date(date);
  startOfDay.setUTCHours(startHour, startMin, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setUTCHours(endHour, endMin, 0, 0);

  let currentSlot = new Date(startOfDay);

  while (currentSlot < endOfDay) {
    const slotEnd = new Date(currentSlot.getTime() + duration * 60 * 1000);

    // Ensure slot doesn't exceed end of day
    if (slotEnd > endOfDay) break;

    // Check for overlap with existing events
    const hasOverlap = events.some((event) => {
      const eventStart = new Date(event.start.dateTime || event.start.date);
      const eventEnd = new Date(event.end.dateTime || event.end.date);

      return currentSlot < eventEnd && slotEnd > eventStart;
    });

    if (!hasOverlap) {
      slots.push(new Date(currentSlot));
    }

    currentSlot = new Date(currentSlot.getTime() + duration * 60 * 1000);
  }

  return slots;
}
