"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BarChart,
  Bell,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Home,
  LogOut,
  MessageSquare,
  Plus,
  Search,
  Settings,
  User,
  XCircle,
  Star,
  MapPin,
} from "lucide-react"
import { format } from "date-fns"

interface Application {
  _id: string
  jobId: string
  userId: string
  status: "pending" | "accepted" | "rejected"
  message: string
  createdAt: string
  updatedAt: string
  user: {
    name: string
    rating: number
    jobsCompleted: number
  }
  job: {
    title: string
    date: string
    location: string
    rate: number
  }
}

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

export default function RecruiterDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    acceptanceRate: 0,
    pendingApplications: 0,
  })
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

      fetchData()
    }
  }, [status, session, router])

  const fetchData = async () => {
    try {
      setIsLoading(true)

      // Fetch jobs posted by the recruiter
      const jobsResponse = await fetch(`/api/users/${session?.user.id}/jobs`)
      if (!jobsResponse.ok) throw new Error("Failed to fetch jobs")
      const jobsData = await jobsResponse.json()

      // Fetch applications for the recruiter's jobs
      const applicationsResponse = await fetch(`/api/recruiter/applications`)
      if (!applicationsResponse.ok) throw new Error("Failed to fetch applications")
      const applicationsData = await applicationsResponse.json()

      setJobs(jobsData.postedJobs || [])
      setApplications(applicationsData.applications || [])

      // Calculate stats
      const totalJobs = jobsData.postedJobs?.length || 0
      const totalApplications = applicationsData.applications?.length || 0
      const acceptedApplications = applicationsData.applications?.filter((app: Application) => app.status === "accepted").length || 0
      const pendingApplications = applicationsData.applications?.filter((app: Application) => app.status === "pending").length || 0

      setStats({
        totalJobs,
        totalApplications,
        acceptanceRate: totalApplications > 0 ? Math.round((acceptedApplications / totalApplications) * 100) : 0,
        pendingApplications,
      })
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Failed to load dashboard data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateApplicationStatus = async (applicationId: string, newStatus: "accepted" | "rejected") => {
    try {
      const response = await fetch(`/api/recruiter/applications/${applicationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update application status")

      // Update local state
      setApplications((prevApplications) =>
        prevApplications.map((app) => (app._id === applicationId ? { ...app, status: newStatus } : app)),
      )

      // Show success message
      setActionSuccess(`Application ${newStatus} successfully`)
      setTimeout(() => setActionSuccess(""), 3000)

      // Refresh data after a short delay
      setTimeout(() => fetchData(), 500)
    } catch (err) {
      console.error("Error updating application status:", err)
      setError("Failed to update application status. Please try again.")
    }
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push("/")
  }

  // Filter applications based on status and search term
  const filteredApplications = applications.filter((app) => {
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    const matchesSearch =
      searchTerm === "" ||
      app.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job.title.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesStatus && matchesSearch
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
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
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {stats.pendingApplications > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  {stats.pendingApplications}
                </span>
              )}
            </Button>
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
            <Button variant="ghost" className="justify-start gap-2 bg-accent" asChild>
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
            <Button variant="ghost" className="justify-start gap-2" asChild>
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
              <Link href="/dashboard/calendar">
                <Calendar className="h-5 w-5" />
                <span>Calendar</span>
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
              <h1 className="text-3xl font-bold tracking-tight animate-fade-in">Recruiter Dashboard</h1>
              <p className="text-muted-foreground animate-fade-in-delayed">Manage your job postings and applications</p>
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

            {/* Stats cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8 animate-fade-in">
              <Card className="transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Jobs Posted</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalJobs}</div>
                  <p className="text-xs text-muted-foreground">Active job postings</p>
                </CardContent>
              </Card>
              <Card className="transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalApplications}</div>
                  <p className="text-xs text-muted-foreground">Across all job postings</p>
                </CardContent>
              </Card>
              <Card className="transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.acceptanceRate}%</div>
                  <p className="text-xs text-muted-foreground">Of all applications</p>
                </CardContent>
              </Card>
              <Card className="transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingApplications}</div>
                  <p className="text-xs text-muted-foreground">Awaiting your response</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Chart */}
            <Card className="mb-8 animate-fade-in">
              <CardHeader>
                <CardTitle>Activity Overview</CardTitle>
                <CardDescription>Applications received over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center border rounded-md">
                  <BarChart className="h-8 w-8 text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Activity chart will appear here</span>
                </div>
              </CardContent>
            </Card>

            {/* Applications Management */}
            <div className="animate-fade-in-delayed">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <h2 className="text-xl font-bold">Applications Management</h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search applicants..."
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
                      <SelectItem value="all">All Applications</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {filteredApplications.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No applications found</h3>
                    <p className="text-muted-foreground text-center max-w-md mb-4">
                      {statusFilter !== "all"
                        ? `No ${statusFilter} applications match your search criteria.`
                        : searchTerm
                          ? "No applications match your search criteria."
                          : "You haven't received any applications yet. Post a job to get started."}
                    </p>
                    {applications.length === 0 && (
                      <Button asChild>
                        <Link href="/post-job">Post a Job</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredApplications.map((application) => (
                    <Card key={application._id} className="animate-fade-in">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold">{application.user.name}</h3>
                              <Badge
                                className={
                                  application.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                    : application.status === "accepted"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                }
                              >
                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              Applied for <span className="font-medium">{application.job.title}</span> on{" "}
                              {format(new Date(application.createdAt), "MMM d, yyyy")}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                {application.user.rating || "N/A"}
                              </span>
                              <span className="flex items-center">
                                <Briefcase className="h-4 w-4 mr-1" />
                                {application.user.jobsCompleted || 0} jobs completed
                              </span>
                            </div>
                          </div>

                          {application.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                                onClick={() => handleUpdateApplicationStatus(application._id, "accepted")}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => handleUpdateApplicationStatus(application._id, "rejected")}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}

                          {application.status === "accepted" && (
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/messages?userId=${application.userId}`}>
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Message
                              </Link>
                            </Button>
                          )}
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm text-muted-foreground mb-1">Applicant's Message:</p>
                          <p className="text-sm">{application.message}</p>
                        </div>

                        <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row sm:justify-between gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Job Details:</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <Badge variant="outline" className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {format(new Date(application.job.date), "MMM d, yyyy")}
                              </Badge>
                              <Badge variant="outline" className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {application.job.location}
                              </Badge>
                              <Badge variant="outline" className="flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" />${application.job.rate}
                              </Badge>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/recruiter/applicants/${application.userId}`}>View Full Profile</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

