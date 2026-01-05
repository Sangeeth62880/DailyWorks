"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Calendar, Clock, DollarSign, Home, MessageSquare, Settings, User } from "lucide-react"
import { format } from "date-fns"

interface Job {
  _id: string
  title: string
  location: string
  date: string
  duration: number
  rate: number
  category: string
  status: string
}

interface Application {
  _id: string
  jobId: string
  userId: string
  status: "pending" | "accepted" | "rejected"
  message: string
  createdAt: string
  job: Job | null
}

export default function ApplicationsPage() {
  const { data: session, status } = useSession()
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "authenticated" && session.user) {
      const fetchApplications = async () => {
        try {
          const response = await fetch(`/api/users/${session.user.id}/applications`)

          if (!response.ok) {
            throw new Error("Failed to fetch applications")
          }

          const data = await response.json()
          setApplications(data.applications)
        } catch (err) {
          console.error("Error fetching applications:", err)
          setError("Failed to load applications. Please try again.")
        } finally {
          setIsLoading(false)
        }
      }

      fetchApplications()
    }
  }, [status, session])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "accepted":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-2xl font-bold tracking-tight transition-transform hover:scale-105">
              DailyWorks
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="gap-2" asChild>
              <Link href="/profile">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r bg-muted/40 lg:block">
          <div className="flex h-full flex-col gap-2 p-4">
            <Button variant="ghost" className="justify-start gap-2" asChild>
              <Link href="/dashboard">
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start gap-2" asChild>
              <Link href="/dashboard/jobs">
                <Briefcase className="h-5 w-5" />
                <span>Find Jobs</span>
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start gap-2 bg-accent" asChild>
              <Link href="/dashboard/applications">
                <Clock className="h-5 w-5" />
                <span>Applications</span>
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start gap-2" asChild>
              <Link href="/dashboard/messages">
                <MessageSquare className="h-5 w-5" />
                <span>Messages</span>
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start gap-2" asChild>
              <Link href="/dashboard/calendar">
                <Calendar className="h-5 w-5" />
                <span>Calendar</span>
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start gap-2" asChild>
              <Link href="/dashboard/earnings">
                <DollarSign className="h-5 w-5" />
                <span>Earnings</span>
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start gap-2" asChild>
              <Link href="/profile">
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start gap-2" asChild>
              <Link href="/dashboard/settings">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          <div className="container py-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight animate-fade-in">Your Applications</h1>
              <p className="text-muted-foreground animate-fade-in-delayed">Track the status of your job applications</p>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-muted-foreground">Loading applications...</p>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-red-500">{error}</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-64">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-medium mb-2">No applications yet</h2>
                <p className="text-muted-foreground mb-4">
                  You haven't applied to any jobs yet. Start by browsing available jobs.
                </p>
                <Button asChild>
                  <Link href="/jobs">Browse Jobs</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {applications.map((application) => (
                  <Card key={application._id} className="animate-fade-in">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <h2 className="text-xl font-bold mb-1">
                            {application.job?.title || "Job no longer available"}
                          </h2>
                          <p className="text-muted-foreground mb-2">
                            Applied on {format(new Date(application.createdAt), "MMM d, yyyy")}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Badge className={getStatusColor(application.status)}>
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </Badge>
                            {application.job && <Badge variant="outline">{application.job.category}</Badge>}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          {application.job && (
                            <Button variant="outline" asChild>
                              <Link href={`/jobs/${application.job._id}`}>View Job</Link>
                            </Button>
                          )}
                          {application.status === "accepted" && (
                            <Button asChild>
                              <Link href={`/dashboard/messages?jobId=${application.jobId}`}>Contact Employer</Link>
                            </Button>
                          )}
                        </div>
                      </div>

                      {application.job && (
                        <div className="mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Location</p>
                            <p>{application.job.location}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Date</p>
                            <p>{format(new Date(application.job.date), "MMM d, yyyy")}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Payment</p>
                            <p>${application.job.rate}</p>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-1">Your Message</p>
                        <p className="text-sm">{application.message}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

