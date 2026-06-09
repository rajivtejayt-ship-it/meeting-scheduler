"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Calendar } from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold">MeetSync</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium hover:text-blue-600">
              Dashboard
            </Link>
            <Link href="/dashboard/availability" className="text-sm font-medium hover:text-blue-600">
              Availability
            </Link>
            <UserButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
