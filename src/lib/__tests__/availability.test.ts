import { getAvailableSlots } from "../availability";

describe("getAvailableSlots", () => {
  const workingHours = { start: 9, end: 17 }; // 9 AM to 5 PM
  const duration = 30; // 30 minutes
  const date = new Date("2026-06-10T00:00:00Z");

  it("should return all slots when there are no events", () => {
    const events: any[] = [];
    const slots = getAvailableSlots(date, workingHours, duration, events);
    
    // 9 AM to 5 PM is 8 hours. 8 hours * 2 slots per hour = 16 slots.
    expect(slots.length).toBe(16);
    expect(slots[0].toISOString()).toContain("T09:00:00");
    expect(slots[15].toISOString()).toContain("T16:30:00");
  });

  it("should filter out slots that overlap with events", () => {
    const events = [
      {
        start: { dateTime: "2026-06-10T10:00:00Z" },
        end: { dateTime: "2026-06-10T11:00:00Z" },
      },
    ];
    const slots = getAvailableSlots(date, workingHours, duration, events);
    
    // Total 16. Overlap at 10:00 and 10:30. Should be 14 slots.
    expect(slots.length).toBe(14);
    expect(slots.find(s => s.toISOString().includes("T10:00:00"))).toBeUndefined();
    expect(slots.find(s => s.toISOString().includes("T10:30:00"))).toBeUndefined();
  });

  it("should handle events that partially overlap slots", () => {
    const events = [
      {
        start: { dateTime: "2026-06-10T12:15:00Z" },
        end: { dateTime: "2026-06-10T12:45:00Z" },
      },
    ];
    const slots = getAvailableSlots(date, workingHours, duration, events);
    
    // Slot 12:00-12:30 overlaps with 12:15-12:45.
    // Slot 12:30-13:00 overlaps with 12:15-12:45.
    // Both 12:00 and 12:30 should be removed.
    expect(slots.find(s => s.toISOString().includes("T12:00:00"))).toBeUndefined();
    expect(slots.find(s => s.toISOString().includes("T12:30:00"))).toBeUndefined();
  });
});
