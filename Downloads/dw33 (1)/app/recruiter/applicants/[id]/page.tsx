"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Home,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Settings,
  Star,
  User,
  XCircle,
} from "lucide-react"
import { format } from "date-fns"

interface Applicant {
  _id: string
  name: string
  email: string
  bio?: string
  skills?: string[]
  rating?: number
  jobsCompleted?: number
  image?: string
  createdAt: string
}

interface Application {
  _id: string
  jobId: string
  userId: string
  status: "pending" | "accepted" | "rejected"
  message: string
  createdAt: string
  job: {
    _id: string
    title: string
    date: string
    location: string
    rate: number
  } | null
}

export default function ApplicantProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const applicantId = resolvedParams.id

  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [applicant, setApplicant] = useState<Applicant | null>(null)
  const [applications, setApplications] = useState<Application[]>([])

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

      fetchApplicantData()
    }
  }, [status, session, router, applicantId])

  const fetchApplicantData = async () => {
    try {
      setIsLoading(true)

      const response = await fetch(`/api/recruiter/applicants/${applicantId}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch applicant data: ${response.status}`)
      }

      const data = await response.json()

      setApplicant(data.applicant)
      setApplications(data.applications || [])
    } catch (err) {
      console.error("Error fetching applicant data:", err)
      setError("Failed to load applicant data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading applicant profile...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchApplicantData}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!applicant) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Applicant Not Found</h1>
          <p className="text-muted-foreground mb-4">The requested applicant profile could not be found.</p>
          <Button asChild>
            <Link href="/recruiter/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
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
                <Briefcase className="h-5 w-5" />
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
            <div className="mb-4">
              <Link href="/recruiter/dashboard" className="text-primary hover:underline">
                ← Back to Dashboard
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Applicant Profile Overview */}
              <Card className="md:col-span-1 animate-fade-in">
                <CardHeader>
                  <CardTitle>Applicant Profile</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={applicant.image || ""} alt={applicant.name} />
                    <AvatarFallback className="text-2xl">{applicant.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">{applicant.name}</h2>
                  <p className="text-muted-foreground">{applicant.email}</p>

                  <div className="flex items-center mt-2">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span>{applicant.rating || 0} Rating</span>
                  </div>

                  <div className="mt-1">
                    <span className="text-muted-foreground">{applicant.jobsCompleted || 0} Jobs Completed</span>
                  </div>

                  <div className="mt-4 w-full">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/dashboard/messages?userId=${applicant._id}`}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message Applicant
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Applicant Details */}
              <Card className="md:col-span-2 animate-fade-in-delayed">
                <CardHeader>
                  <CardTitle>Applicant Details</CardTitle>
                  <CardDescription>Personal information and skills</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Contact Information</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                          <span>{applicant.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-muted-foreground mr-2" />
                          <span className="text-muted-foreground">Contact information available after acceptance</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Bio</h3>
                      <p className="text-muted-foreground">{applicant.bio || "No bio provided."}</p>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Skills</h3>
                      {applicant.skills && applicant.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {applicant.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No skills listed.</p>
                      )}
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Member Since</h3>
                      <p className="text-muted-foreground">
                        {applicant.createdAt ? format(new Date(applicant.createdAt), "MMMM d, yyyy") : "Unknown"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Applications History */}
              <Card className="md:col-span-3 animate-fade-in-delayed">
                <CardHeader>
                  <CardTitle>Application History</CardTitle>
                  <CardDescription>Applications submitted to your jobs</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all">
                    <TabsList className="mb-4">
                      <TabsTrigger value="all">All Applications</TabsTrigger>
                      <TabsTrigger value="pending">Pending</TabsTrigger>
                      <TabsTrigger value="accepted">Accepted</TabsTrigger>
                      <TabsTrigger value="rejected">Rejected</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-4">
                      {applications.length === 0 ? (
                        <div className="text-center py-8">
                          <Clock className="h-12 w-12 mx-auto text-muted-foreground" />
                          <h3 className="mt-4 text-lg font-medium">No applications found</h3>
                          <p className="text-muted-foreground">
                            This applicant hasn't applied to any of your jobs yet.
                          </p>
                        </div>
                      ) : (
                        applications.map((application) => (
                          <Card key={application._id}>
                            <CardContent className="p-6">
                              <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold">{application.job?.title || "Unknown Job"}</h3>
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
                                  <p className="text-sm text-muted-foreground">
                                    Applied on {format(new Date(application.createdAt), "MMM d, yyyy")}
                                  </p>
                                </div>
                                {application.job && (
                                  <div className="flex flex-wrap gap-2">
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
                                )}
                              </div>
                              <div className="mt-4 pt-4 border-t">
                                <p className="text-sm text-muted-foreground mb-1">Application Message:</p>
                                <p className="text-sm">{application.message}</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </TabsContent>

                    <TabsContent value="pending" className="space-y-4">
                      {applications.filter((app) => app.status === "pending").length === 0 ? (
                        <div className="text-center py-8">
                          <Clock className="h-12 w-12 mx-auto text-muted-foreground" />
                          <h3 className="mt-4 text-lg font-medium">No pending applications</h3>
                          <p className="text-muted-foreground">
                            There are no pending applications from this applicant.
                          </p>
                        </div>
                      ) : (
                        applications
                          .filter((app) => app.status === "pending")
                          .map((application) => (
                            <Card key={application._id}>
                              <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-bold">{application.job?.title || "Unknown Job"}</h3>
                                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                                        Pending
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      Applied on {format(new Date(application.createdAt), "MMM d, yyyy")}
                                    </p>
                                  </div>
                                  {application.job && (
                                    <div className="flex flex-wrap gap-2">
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
                                  )}
                                </div>
                                <div className="mt-4 pt-4 border-t">
                                  <p className="text-sm text-muted-foreground mb-1">Application Message:</p>
                                  <p className="text-sm">{application.message}</p>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                      )}
                    </TabsContent>

                    <TabsContent value="accepted" className="space-y-4">
                      {applications.filter((app) => app.status === "accepted").length === 0 ? (
                        <div className="text-center py-8">
                          <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                          <h3 className="mt-4 text-lg font-medium">No accepted applications</h3>
                          <p className="text-muted-foreground">
                            You haven't accepted any applications from this applicant yet.
                          </p>
                        </div>
                      ) : (
                        applications
                          .filter((app) => app.status === "accepted")
                          .map((application) => (
                            <Card key={application._id}>
                              <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-bold">{application.job?.title || "Unknown Job"}</h3>
                                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                        Accepted
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      Applied on {format(new Date(application.createdAt), "MMM d, yyyy")}
                                    </p>
                                  </div>
                                  {application.job && (
                                    <div className="flex flex-wrap gap-2">
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
                                  )}
                                </div>
                                <div className="mt-4 pt-4 border-t">
                                  <p className="text-sm text-muted-foreground mb-1">Application Message:</p>
                                  <p className="text-sm">{application.message}</p>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                      )}
                    </TabsContent>

                    <TabsContent value="rejected" className="space-y-4">
                      {applications.filter((app) => app.status === "rejected").length === 0 ? (
                        <div className="text-center py-8">
                          <XCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                          <h3 className="mt-4 text-lg font-medium">No rejected applications</h3>
                          <p className="text-muted-foreground">
                            You haven't rejected any applications from this applicant.
                          </p>
                        </div>
                      ) : (
                        applications
                          .filter((app) => app.status === "rejected")
                          .map((application) => (
                            <Card key={application._id}>
                              <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-bold">{application.job?.title || "Unknown Job"}</h3>
                                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                                        Rejected
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      Applied on {format(new Date(application.createdAt), "MMM d, yyyy")}
                                    </p>
                                  </div>
                                  {application.job && (
                                    <div className="flex flex-wrap gap-2">
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
                                  )}
                                </div>
                                <div className="mt-4 pt-4 border-t">
                                  <p className="text-sm text-muted-foreground mb-1">Application Message:</p>
                                  <p className="text-sm">{application.message}</p>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

