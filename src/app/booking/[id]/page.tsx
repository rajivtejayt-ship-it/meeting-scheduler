import { db } from "@/db";
import { meetingTypes, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { BookingCalendar } from "@/components/booking-calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock } from "lucide-react";

export default async function BookingPage({ params }: { params: { id: string } }) {
  const meetingType = await db.query.meetingTypes.findFirst({
    where: eq(meetingTypes.id, params.id),
    with: {
      user: true
    }
  });

  if (!meetingType) notFound();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
             <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
               {meetingType.user?.name?.[0] || "H"}
             </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{meetingType.name}</h1>
          <p className="text-gray-600 max-w-lg mx-auto">{meetingType.description}</p>
          <div className="flex justify-center items-center gap-2 text-gray-500 font-medium">
            <Clock className="h-5 w-5" />
            <span>{meetingType.duration} Minutes</span>
          </div>
        </div>

        <BookingCalendar meetingTypeId={meetingType.id} />
      </div>
    </div>
  );
}
