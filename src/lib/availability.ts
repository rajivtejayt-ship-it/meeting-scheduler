export function getAvailableSlots(
  date: Date,
  workingHours: { start: number; end: number },
  duration: number,
  events: any[]
) {
  const slots: Date[] = [];
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(workingHours.start, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setUTCHours(workingHours.end, 0, 0, 0);

  let currentSlot = new Date(startOfDay);

  while (currentSlot < endOfDay) {
    const slotEnd = new Date(currentSlot.getTime() + duration * 60 * 1000);

    // Check for overlap with existing events
    const hasOverlap = events.some((event) => {
      const eventStart = new Date(event.start.dateTime);
      const eventEnd = new Date(event.end.dateTime);

      // Overlap logic: (StartA < EndB) && (EndA > StartB)
      return currentSlot < eventEnd && slotEnd > eventStart;
    });

    if (!hasOverlap) {
      slots.push(new Date(currentSlot));
    }

    currentSlot = new Date(currentSlot.getTime() + duration * 60 * 1000);
  }

  return slots;
}
