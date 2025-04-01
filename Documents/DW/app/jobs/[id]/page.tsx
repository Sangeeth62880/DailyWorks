import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, DollarSign, MapPin, User } from "lucide-react"
import { getCollections } from "@/lib/db"
import { ObjectId } from "mongodb"
import { format } from "date-fns"
import { notFound } from "next/navigation"

async function getJob(id: string) {
  try {
    const { jobs, users } = await getCollections()

    if (!ObjectId.isValid(id)) {
      return null
    }

    const job = await jobs.findOne({ _id: new ObjectId(id) })

    if (!job) {
      return null
    }

    // Get creator info
    let creator = null
    if (job.createdBy) {
      creator = await users.findOne({ _id: new ObjectId(job.createdBy) }, { projection: { name: 1, rating: 1 } })
    }

    return {
      ...job,
      _id: job._id.toString(),
      createdBy: creator || { name: "Unknown User", rating: 0 },
    }
  } catch (error) {
    console.error("Error fetching job:", error)
    return null
  }
}

async function getSimilarJobs(id: string, category: string) {
  try {
    const { jobs } = await getCollections()

    const similarJobs = await jobs
      .find({
        _id: { $ne: new ObjectId(id) },
        category: category,
        status: "open",
      })
      .limit(3)
      .toArray()

    return similarJobs.map((job) => ({
      ...job,
      _id: job._id.toString(),
    }))
  } catch (error) {
    console.error("Error fetching similar jobs:", error)
    return []
  }
}

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const job = await getJob(params.id)

  if (!job) {
    notFound()
  }

  const similarJobs = await getSimilarJobs(params.id, job.category)

  // Parse requirements if they're stored as a string
  const requirements =
    typeof job.requirements === "string"
      ? job.requirements.split("\n").filter((req) => req.trim() !== "")
      : Array.isArray(job.requirements)
        ? job.requirements
        : ["No specific requirements listed"]

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

      <main className="flex-1">
        <div className="container py-6">
          <div className="mb-4">
            <Link href="/jobs" className="text-primary hover:underline">
              ← Back to Jobs
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main job details */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="animate-fade-in">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{job.title}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">${job.rate}</div>
                      <CardDescription>One day</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Job Details</h3>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(job.date), "MMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{job.duration} hours</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>${job.rate} total</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p>{job.description}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Requirements</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle>Apply for this job</CardTitle>
                  <CardDescription>
                    This job is available for {format(new Date(job.date), "MMMM d, yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/jobs/${job._id}/apply`}>
                    <Button className="w-full mb-4 transition-all hover:scale-[1.02]">Apply Now</Button>
                  </Link>
                  <p className="text-sm text-muted-foreground text-center">
                    You'll be able to send a message with your application
                  </p>
                </CardContent>
              </Card>

              <Card className="animate-fade-in-delayed">
                <CardHeader>
                  <CardTitle>Posted by</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">{job.createdBy.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="flex items-center">★ {job.createdBy.rating || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {similarJobs.length > 0 && (
                <Card className="animate-fade-in-delayed">
                  <CardHeader>
                    <CardTitle>Similar Jobs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {similarJobs.map((similarJob) => (
                        <div key={similarJob._id} className="border-b pb-4 last:border-0 last:pb-0">
                          <Link href={`/jobs/${similarJob._id}`}>
                            <h3 className="font-medium hover:text-primary">{similarJob.title}</h3>
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(similarJob.date), "MMM d, yyyy")} • ${similarJob.rate}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
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

