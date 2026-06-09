'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Something went wrong!</CardTitle>
          <CardDescription>
            We encountered an unexpected error. Our team has been notified.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md break-words">
            {error.message || "An unknown error occurred"}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => reset()} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Try again
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
