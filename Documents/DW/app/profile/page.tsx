"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Calendar, Clock, DollarSign, Home, MessageSquare, Settings, Star, User } from "lucide-react"

interface UserProfile {
  _id: string
  name: string
  email: string
  image?: string
  bio?: string
  skills?: string[]
  rating?: number
  jobsCompleted?: number
  createdAt: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    skills: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }

    if (status === "authenticated" && session.user) {
      // Fetch user profile
      const fetchProfile = async () => {
        try {
          const response = await fetch(`/api/users/${session.user.id}`)

          if (!response.ok) {
            throw new Error("Failed to fetch profile")
          }

          const data = await response.json()
          setProfile(data.user)

          // Initialize form data
          setFormData({
            name: data.user.name || "",
            bio: data.user.bio || "",
            skills: data.user.skills ? data.user.skills.join(", ") : "",
          })
        } catch (err) {
          console.error("Error fetching profile:", err)
          setError("Failed to load profile. Please try again.")
        } finally {
          setIsLoading(false)
        }
      }

      fetchProfile()
    }
  }, [status, session, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError("")
    setSaveSuccess(false)

    try {
      const response = await fetch(`/api/users/${session?.user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          bio: formData.bio,
          skills: formData.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      // Update local profile state
      setProfile((prev) => {
        if (!prev) return null

        return {
          ...prev,
          name: formData.name,
          bio: formData.bio,
          skills: formData.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
        }
      })

      setSaveSuccess(true)
      setIsEditing(false)
    } catch (err) {
      console.error("Error updating profile:", err)
      setSaveError("Failed to update profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
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
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="container py-8 flex-1">
          <div className="flex justify-center items-center h-full">
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
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
              DayWork
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="gap-2" asChild>
              <Link href="/dashboard">
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
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
            <Button variant="ghost" className="justify-start gap-2" asChild>
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
            <Button variant="ghost" className="justify-start gap-2 bg-accent" asChild>
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
              <h1 className="text-3xl font-bold tracking-tight animate-fade-in">Your Profile</h1>
              <p className="text-muted-foreground animate-fade-in-delayed">
                Manage your personal information and preferences
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {saveSuccess && (
              <Alert className="mb-6 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                <AlertDescription>Profile updated successfully!</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-6 md:grid-cols-3">
              {/* Profile Overview */}
              <Card className="md:col-span-1 animate-fade-in">
                <CardHeader>
                  <CardTitle>Profile Overview</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={profile?.image || ""} alt={profile?.name || "User"} />
                    <AvatarFallback className="text-2xl">{profile?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">{profile?.name}</h2>
                  <p className="text-muted-foreground">{profile?.email}</p>

                  <div className="flex items-center mt-2">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span>{profile?.rating || 0} Rating</span>
                  </div>

                  <div className="mt-1">
                    <span className="text-muted-foreground">{profile?.jobsCompleted || 0} Jobs Completed</span>
                  </div>

                  <div className="mt-4 w-full">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsEditing(true)}
                      disabled={isEditing}
                    >
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Details */}
              <Card className="md:col-span-2 animate-fade-in-delayed">
                <CardHeader>
                  <CardTitle>Profile Details</CardTitle>
                  {!isEditing && <CardDescription>Your personal information and skills</CardDescription>}
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      {saveError && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertDescription>{saveError}</AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your full name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          placeholder="Tell us about yourself"
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="skills">Skills (comma separated)</Label>
                        <Input
                          id="skills"
                          name="skills"
                          value={formData.skills}
                          onChange={handleChange}
                          placeholder="e.g., Moving, Cleaning, Gardening"
                        />
                      </div>

                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false)
                            // Reset form data
                            setFormData({
                              name: profile?.name || "",
                              bio: profile?.bio || "",
                              skills: profile?.skills ? profile.skills.join(", ") : "",
                            })
                          }}
                          disabled={isSaving}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                          {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium mb-2">Bio</h3>
                        <p className="text-muted-foreground">{profile?.bio || "No bio provided yet."}</p>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">Skills</h3>
                        {profile?.skills && profile.skills.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {profile.skills.map((skill, index) => (
                              <Badge key={index} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No skills listed yet.</p>
                        )}
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">Member Since</h3>
                        <p className="text-muted-foreground">
                          {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "Unknown"}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Activity Tabs */}
              <Card className="md:col-span-3 animate-fade-in-delayed">
                <CardHeader>
                  <CardTitle>Your Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="jobs">
                    <TabsList className="mb-4">
                      <TabsTrigger value="jobs">Jobs Completed</TabsTrigger>
                      <TabsTrigger value="applications">Applications</TabsTrigger>
                      <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    </TabsList>

                    <TabsContent value="jobs" className="space-y-4">
                      <div className="text-center py-8">
                        <Briefcase className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No jobs completed yet</h3>
                        <p className="text-muted-foreground">When you complete jobs, they will appear here</p>
                        <Button className="mt-4" asChild>
                          <Link href="/jobs">Find Jobs</Link>
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="applications" className="space-y-4">
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No applications yet</h3>
                        <p className="text-muted-foreground">When you apply for jobs, they will appear here</p>
                        <Button className="mt-4" asChild>
                          <Link href="/jobs">Browse Jobs</Link>
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="reviews" className="space-y-4">
                      <div className="text-center py-8">
                        <Star className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No reviews yet</h3>
                        <p className="text-muted-foreground">When you receive reviews, they will appear here</p>
                      </div>
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

