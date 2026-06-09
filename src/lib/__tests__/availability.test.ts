import { getAvailableSlots } from "../availability";

describe("getAvailableSlots", () => {
  const workingHours = { start: "09:00", end: "17:00", isActive: true };
  const duration = 30; // 30 minutes
  const date = new Date("2026-06-10T00:00:00Z");

  it("should return all slots when there are no events", () => {
    const events: any[] = [];
    const slots = getAvailableSlots(date, workingHours, duration, events);
    
    expect(slots.length).toBe(16);
    expect(slots[0].toISOString()).toContain("T09:00:00");
    expect(slots[15].toISOString()).toContain("T16:30:00");
  });

  it("should return empty array if day is inactive", () => {
    const slots = getAvailableSlots(date, { ...workingHours, isActive: false }, duration, []);
    expect(slots.length).toBe(0);
  });

  it("should filter out slots that overlap with events", () => {
    const events = [
      {
        start: { dateTime: "2026-06-10T10:00:00Z" },
        end: { dateTime: "2026-06-10T11:00:00Z" },
      },
    ];
    const slots = getAvailableSlots(date, workingHours, duration, events);
    
    expect(slots.length).toBe(14);
    expect(slots.find(s => s.toISOString().includes("T10:00:00"))).toBeUndefined();
    expect(slots.find(s => s.toISOString().includes("T10:30:00"))).toBeUndefined();
  });
});
