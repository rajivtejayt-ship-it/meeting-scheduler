import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Calendar, Clock, Globe, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center" href="#">
          <Calendar className="h-6 w-6 text-blue-600" />
          <span className="ml-2 text-xl font-bold">MeetSync</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/sign-in">
            Sign In
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-white text-center">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-gray-900">
                  Scheduling Simplified
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  Connect your Google Calendar and let others book time with you effortlessly. No more back-and-forth emails.
                </p>
              </div>
              <div className="space-x-4">
                <Link 
                  href="/sign-up" 
                  className={cn(buttonVariants({ variant: "default", size: "lg" }), "bg-blue-600 hover:bg-blue-700 text-white px-8")}
                >
                  Get Started for Free
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold">Global Availability</h2>
                <p className="text-gray-500">Share your custom link and let anyone book a meeting across time zones.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold">Real-time Sync</h2>
                <p className="text-gray-500">Automatically syncs with your Google Calendar to prevent double bookings.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold">Secure Auth</h2>
                <p className="text-gray-500">Secure sign-in with Google via Clerk. Your data stays protected.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">© 2026 MeetSync. All rights reserved.</p>
      </footer>
    </div>
  );
}
