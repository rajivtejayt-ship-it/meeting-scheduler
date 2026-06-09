import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center py-10">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Booking Confirmed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600">
            A calendar invitation has been sent to your email address. We look forward to seeing you!
          </p>
          <Link href="/" className={cn(buttonVariants({ variant: "default", size: "lg" }), "w-full bg-blue-600 hover:bg-blue-700 text-white")}>
            Back to Home
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
