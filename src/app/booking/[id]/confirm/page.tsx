"use client";

import { useState, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, User } from "lucide-react";
import { confirmBooking } from "@/app/actions/booking";
import { toast } from "sonner";

export default function ConfirmBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const slot = searchParams.get("slot");
  const [loading, setLoading] = useState(false);

  if (!slot) {
    return <div>Invalid booking link.</div>;
  }

  const slotDate = new Date(slot);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    formData.append("meetingTypeId", id);
    formData.append("slot", slot!);

    try {
      await confirmBooking(formData);
      toast.success("Booking confirmed!");
      router.push(`/booking/${id}/success`);
    } catch (error) {
      toast.error("Failed to confirm booking");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Confirm Booking</CardTitle>
          <CardDescription>Enter your details to finalize the meeting.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg space-y-2 mb-6 text-sm">
            <div className="flex items-center gap-2 text-blue-700 font-medium">
              <Calendar className="h-4 w-4" />
              <span>{format(slotDate, "EEEE, MMMM do, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2 text-blue-700 font-medium">
              <Clock className="h-4 w-4" />
              <span>{format(slotDate, "h:mm a")}</span>
            </div>
          </div>

          <form id="confirm-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guestName">Your Name</Label>
              <Input id="guestName" name="guestName" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guestEmail">Email Address</Label>
              <Input id="guestEmail" name="guestEmail" type="email" placeholder="john@example.com" required />
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" form="confirm-form" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading ? "Confirming..." : "Confirm Booking"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
