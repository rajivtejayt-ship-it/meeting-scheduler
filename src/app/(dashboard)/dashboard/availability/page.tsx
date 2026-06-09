"use client";

import { useState, useEffect } from "react";
import { getAvailability, updateAvailability } from "@/app/actions/availability";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIMES = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2).toString().padStart(2, "0");
  const minute = (i % 2 === 0 ? "00" : "30");
  return `${hour}:${minute}`;
});

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAvailability();
        setAvailability(data);
      } catch (error) {
        toast.error("Failed to fetch availability");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await updateAvailability(availability);
      toast.success("Availability updated successfully");
    } catch (error) {
      toast.error("Failed to update availability");
    } finally {
      setSaving(false);
    }
  }

  function updateDay(index: number, updates: any) {
    const newAvailability = [...availability];
    newAvailability[index] = { ...newAvailability[index], ...updates };
    setAvailability(newAvailability);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Availability</h1>
        <p className="text-gray-500">Set your weekly recurring schedule.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>Configure when you are available for meetings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {DAYS.map((dayName, index) => {
            const dayData = availability.find((a) => a.dayOfWeek === index);
            if (!dayData) return null;

            return (
              <div key={dayName} className="flex items-center justify-between py-4 border-b last:border-0">
                <div className="flex items-center gap-4 w-32">
                  <Switch
                    checked={dayData.isActive}
                    onCheckedChange={(checked) => updateDay(index, { isActive: checked })}
                  />
                  <span className="font-medium">{dayName}</span>
                </div>

                {dayData.isActive ? (
                  <div className="flex items-center gap-2">
                    <Select
                      value={dayData.startTime}
                      onValueChange={(val) => updateDay(index, { startTime: val })}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMES.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span>-</span>
                    <Select
                      value={dayData.endTime}
                      onValueChange={(val) => updateDay(index, { endTime: val })}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMES.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <span className="text-gray-400 italic">Unavailable</span>
                )}
              </div>
            );
          })}
        </CardContent>
        <div className="p-6 border-t flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
