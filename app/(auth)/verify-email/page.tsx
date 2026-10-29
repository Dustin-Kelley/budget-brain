import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center px-4 py-10 sm:px-6">
      <Card className="w-full max-w-md gap-8 py-8 sm:py-10">
        <CardHeader className="gap-3 px-5 text-center sm:px-8">
          <CardTitle className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Check your email
          </CardTitle>
          <CardDescription className="text-base leading-relaxed text-balance">
            We sent you a verification link. Please check your email to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 sm:px-8">
          <Button asChild className="h-11 w-full text-base">
            <Link href="/login">Back to Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 