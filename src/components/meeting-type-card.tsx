"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Copy, Eye } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface MeetingType {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  isActive: boolean;
}

export function MeetingTypeCard({ meetingType }: { meetingType: MeetingType }) {
  const bookingPath = `/booking/${meetingType.id}`;

  const copyLink = () => {
    const bookingUrl = `${window.location.origin}${bookingPath}`;
    navigator.clipboard.writeText(bookingUrl);
    toast.success("Link copied to clipboard");
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold">{meetingType.name}</CardTitle>
          <Badge variant={meetingType.isActive ? "default" : "secondary"}>
            {meetingType.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <CardDescription>{meetingType.description || "No description"}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-gray-500 gap-2">
          <Clock className="h-4 w-4" />
          <span>{meetingType.duration} minutes</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="outline" size="sm" onClick={copyLink} className="gap-2">
          <Copy className="h-4 w-4" />
          Copy Link
        </Button>
        <Link
          href={bookingPath}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2")}
        >
          <Eye className="h-4 w-4" />
          View Page
        </Link>
      </CardFooter>
    </Card>
  );
}
