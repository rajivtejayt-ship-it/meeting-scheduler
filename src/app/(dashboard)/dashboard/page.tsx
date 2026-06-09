import { getMeetingTypes } from "@/app/actions/meeting-types";
import { syncUser } from "@/app/actions/user";
import { MeetingTypeCard } from "@/components/meeting-type-card";
import { CreateMeetingType } from "@/components/create-meeting-type";
import { Toaster } from "@/components/ui/sonner";

export default async function DashboardPage() {
  await syncUser();
  const meetingTypes = await getMeetingTypes();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Manage your meeting types and availability.</p>
        </div>
        <CreateMeetingType />
      </div>

      {meetingTypes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-dashed">
          <h2 className="text-xl font-semibold">No meeting types yet</h2>
          <p className="text-gray-500 mb-6">Create your first meeting type to start scheduling.</p>
          <CreateMeetingType />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {meetingTypes.map((mt) => (
            <MeetingTypeCard key={mt.id} meetingType={mt} />
          ))}
        </div>
      )}
      <Toaster />
    </div>
  );
}
