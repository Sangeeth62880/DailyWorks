import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function JobPostSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-2xl font-bold tracking-tight transition-transform hover:scale-105">
              DayWork
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="transition-all hover:scale-105">
                Login
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="transition-all hover:scale-105">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="container max-w-md text-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-primary/10 p-3">
              <CheckCircle className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Job Posted Successfully!</h1>
            <p className="text-muted-foreground">
              Your job has been posted and is now visible to potential workers. You'll be notified when someone applies.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row mt-4">
              <Link href="/dashboard">
                <Button className="w-full sm:w-auto">Go to Dashboard</Button>
              </Link>
              <Link href="/post-job">
                <Button variant="outline" className="w-full sm:w-auto">
                  Post Another Job
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} DayWork. All rights reserved.
          </p>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline underline-offset-4">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline underline-offset-4">
              Privacy
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:underline underline-offset-4">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

