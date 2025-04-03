"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  Edit,
  Home,
  LogOut,
  MapPin,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Trash2,
  User,
} from "lucide-react"
import { format } from "date-fns"

interface Job {
  _id: string
  title: string
  description: string
  location: string
  date: string
  duration: number
  rate: number
  category: string
  status: "open" | "assigned" | "completed" | "cancelled"
  applicants: string[]
  createdAt: string
  updatedAt: string
}

export default function RecruiterJobsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [jobs, setJobs] = useState<Job[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [actionSuccess, setActionSuccess] = useState("")

  // Check if user is authenticated and has recruiter role
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
      return
    }

    if (status === "authenticated") {
      if (session?.user?.role !== "recruiter") {
        router.push("/dashboard")
        return
      }

      fetchJobs()
    }
  }, [status, session, router])

  const fetchJobs = async () => {
    try {
      setIsLoading(true)

      const response = await fetch(`/api/users/${session?.user.id}/jobs`)

      if (!response.ok) {
        throw new Error("Failed to fetch jobs")
      }

      const data = await response.json()
      setJobs(data.postedJobs || [])
    } catch (err) {
      console.error("Error fetching jobs:", err)
      setError("Failed to load jobs. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete job")
      }

      // Update local state
      setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId))

      // Show success message
      setActionSuccess("Job deleted successfully")
      setTimeout(() => setActionSuccess(""), 3000)
    } catch (err) {
      console.error("Error deleting job:", err)
      setError("Failed to delete job. Please try again.")
    }
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push("/")
  }

  // Filter jobs based on status and search term
  const filteredJobs = jobs.filter((job) => {
    const matchesStatus = statusFilter === "all" || job.status === statusFilter
    const matchesSearch =
      searchTerm === "" ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesStatus && matchesSearch
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading jobs...</p>
      </div>
    )
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
            <Button variant="ghost" size="sm" className="gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r bg-muted/40 lg:block">
          <div className="flex h-full flex-col gap-2 p-4">
            <Button variant="ghost" className="justify-start gap-2" asChild>
              <Link href="/recruiter/dashboard">
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start gap-2" asChild>
              <Link href="/post-job">
                <Plus className="h-5 w-5" />
                <span>Post New Job</span>
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start gap-2 bg-accent" asChild>
              <Link href="/recruiter/jobs">
                <Briefcase className="h-5 w-5" />
                <span>My Jobs</span>
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start gap-2" asChild>
              <Link href="/recruiter/applications">
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
        <main className="flex-1 overflow-auto">
          <div className="container py-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight animate-fade-in">My Jobs</h1>
              <p className="text-muted-foreground animate-fade-in-delayed">Manage your job postings</p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {actionSuccess && (
              <Alert className="mb-6 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                <AlertDescription>{actionSuccess}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <Button asChild>
                <Link href="/post-job">
                  <Plus className="h-4 w-4 mr-2" />
                  Post New Job
                </Link>
              </Button>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search jobs..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Jobs</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredJobs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-4">
                    {statusFilter !== "all"
                      ? `No ${statusFilter} jobs match your search criteria.`
                      : searchTerm
                        ? "No jobs match your search criteria."
                        : "You haven't posted any jobs yet."}
                  </p>
                  <Button asChild>
                    <Link href="/post-job">Post Your First Job</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <Card key={job._id} className="animate-fade-in">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold">{job.title}</h3>
                            <Badge
                              className={
                                job.status === "open"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                  : job.status === "assigned"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                    : job.status === "completed"
                                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                              }
                            >
                              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Posted on {format(new Date(job.createdAt), "MMM d, yyyy")}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(new Date(job.date), "MMM d, yyyy")}
                            </Badge>
                            <Badge variant="outline" className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {job.location}
                            </Badge>
                            <Badge variant="outline" className="flex items-center">
                              <DollarSign className="h-3 w-3 mr-1" />${job.rate}
                            </Badge>
                            <Badge variant="outline" className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {job.duration} hours
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/jobs/${job._id}`}>View</Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/post-job/edit/${job._id}`}>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleDeleteJob(job._id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-muted-foreground">Applicants:</p>
                            <p className="font-medium">{job.applicants?.length || 0} applicants</p>
                          </div>
                          {job.applicants?.length > 0 && (
                            <Button size="sm" asChild>
                              <Link href={`/recruiter/applications?jobId=${job._id}`}>View Applicants</Link>
                            </Button>
                          )}
                        </div>
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

