import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { ArrowRight, Briefcase, Clock, DollarSign } from "lucide-react"

export default function Home() {
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
            <ModeToggle />
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

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Find One-Day Jobs That Fit Your Schedule
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl animate-fade-in-delayed">
                    Connect with local opportunities, work on your terms, and get paid quickly.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/jobs">
                    <Button size="lg" className="transition-all hover:scale-105">
                      Find Jobs <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/post-job">
                    <Button size="lg" variant="outline" className="transition-all hover:scale-105">
                      Post a Job
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-[350px] animate-fade-in-delayed">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-primary-foreground opacity-20 blur-3xl"></div>
                  <div className="relative flex h-full w-full items-center justify-center rounded-xl bg-muted p-6">
                    <div className="text-center">
                      <Briefcase className="mx-auto h-16 w-16 text-primary" />
                      <h3 className="mt-4 text-xl font-bold">Start earning today</h3>
                      <p className="mt-2 text-muted-foreground">Hundreds of one-day opportunities waiting for you</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">How DayWork Works</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Find, apply, and get paid for one-day jobs in three simple steps.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md hover:scale-[1.02]">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Find Jobs</h3>
                <p className="text-center text-muted-foreground">
                  Browse through hundreds of one-day job opportunities in your area.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md hover:scale-[1.02]">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Complete Work</h3>
                <p className="text-center text-muted-foreground">
                  Show up, do great work, and confirm completion through the app.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md hover:scale-[1.02]">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Get Paid</h3>
                <p className="text-center text-muted-foreground">
                  Receive payment quickly and securely through our platform.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Browse by Category</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Discover opportunities across various industries and skill sets.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 py-12 md:grid-cols-3 lg:grid-cols-4">
              {categories.map((category, index) => (
                <Link
                  key={index}
                  href={`/categories/${category.slug}`}
                  className="flex flex-col items-center space-y-2 rounded-lg border p-4 shadow-sm transition-all hover:shadow-md hover:scale-[1.05] hover:bg-accent"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    {category.icon}
                  </div>
                  <h3 className="text-center font-medium">{category.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to start earning on your schedule?
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of people finding flexible work opportunities every day.
              </p>
            </div>
            <div className="flex gap-4 lg:justify-end">
              <Link href="/auth/register">
                <Button size="lg" className="transition-all hover:scale-105">
                  Sign Up Now
                </Button>
              </Link>
              <Link href="/jobs">
                <Button size="lg" variant="outline" className="transition-all hover:scale-105">
                  Browse Jobs
                </Button>
              </Link>
            </div>
          </div>
        </section>
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

// Sample categories data
const categories = [
  {
    name: "Cleaning",
    slug: "cleaning",
    icon: <Briefcase className="h-6 w-6 text-primary" />,
  },
  {
    name: "Delivery",
    slug: "delivery",
    icon: <Briefcase className="h-6 w-6 text-primary" />,
  },
  {
    name: "Moving",
    slug: "moving",
    icon: <Briefcase className="h-6 w-6 text-primary" />,
  },
  {
    name: "Gardening",
    slug: "gardening",
    icon: <Briefcase className="h-6 w-6 text-primary" />,
  },
  {
    name: "Handyman",
    slug: "handyman",
    icon: <Briefcase className="h-6 w-6 text-primary" />,
  },
  {
    name: "Photography",
    slug: "photography",
    icon: <Briefcase className="h-6 w-6 text-primary" />,
  },
  {
    name: "Event Staff",
    slug: "event-staff",
    icon: <Briefcase className="h-6 w-6 text-primary" />,
  },
  {
    name: "Office Help",
    slug: "office-help",
    icon: <Briefcase className="h-6 w-6 text-primary" />,
  },
]

