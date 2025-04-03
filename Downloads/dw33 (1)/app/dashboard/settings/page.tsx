"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Briefcase,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  User,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("account")
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Mock settings data
  const [settings, setSettings] = useState({
    account: {
      email: "user@example.com",
      phone: "+1 (555) 123-4567",
    },
    notifications: {
      emailNotifications: true,
      jobAlerts: true,
      applicationUpdates: true,
      messageNotifications: true,
      marketingEmails: false,
    },
    privacy: {
      profileVisibility: "public",
      showEarnings: false,
      showRating: true,
    },
    payment: {
      defaultPaymentMethod: "bank",
      bankAccount: "••••4567",
      paypalEmail: "user@example.com",
    },
  })

  const handleSwitchChange = (category, setting) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: !settings[category][setting],
      },
    })
  }

  const handleSave = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setSaveSuccess(true)
      setIsLoading(false)
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000)
    }, 1000)
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push("/")
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
              <Link href="/dashboard">
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start gap-2" asChild>
              <Link href="/jobs">
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
            <Button variant="ghost" className="justify-start gap-2" asChild>
              <Link href="/profile">
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start gap-2 bg-accent" asChild>
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
              <h1 className="text-3xl font-bold tracking-tight animate-fade-in">Settings</h1>
              <p className="text-muted-foreground animate-fade-in-delayed">
                Manage your account preferences and settings
              </p>
            </div>

            {saveSuccess && (
              <Alert className="mb-6 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                <AlertDescription>Settings saved successfully!</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="account" className="animate-fade-in">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
                <TabsTrigger value="payment">Payment</TabsTrigger>
              </TabsList>

              <TabsContent value="account" className="mt-6 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>Update your account details and contact information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={settings.account.email}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            account: { ...settings.account, email: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={settings.account.phone}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            account: { ...settings.account, phone: e.target.value },
                          })
                        }
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSave} disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>Change your password</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Update Password</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="mt-6 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Choose how you want to be notified</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={settings.notifications.emailNotifications}
                        onCheckedChange={() => handleSwitchChange("notifications", "emailNotifications")}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Job Alerts</Label>
                        <p className="text-sm text-muted-foreground">Get notified about new job opportunities</p>
                      </div>
                      <Switch
                        checked={settings.notifications.jobAlerts}
                        onCheckedChange={() => handleSwitchChange("notifications", "jobAlerts")}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Application Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when your application status changes
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.applicationUpdates}
                        onCheckedChange={() => handleSwitchChange("notifications", "applicationUpdates")}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Message Notifications</Label>
                        <p className="text-sm text-muted-foreground">Get notified when you receive new messages</p>
                      </div>
                      <Switch
                        checked={settings.notifications.messageNotifications}
                        onCheckedChange={() => handleSwitchChange("notifications", "messageNotifications")}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Marketing Emails</Label>
                        <p className="text-sm text-muted-foreground">Receive promotional emails and newsletters</p>
                      </div>
                      <Switch
                        checked={settings.notifications.marketingEmails}
                        onCheckedChange={() => handleSwitchChange("notifications", "marketingEmails")}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSave} disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="privacy" className="mt-6 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>Control what information is visible to others</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="profile-visibility">Profile Visibility</Label>
                      <select
                        id="profile-visibility"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={settings.privacy.profileVisibility}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            privacy: { ...settings.privacy, profileVisibility: e.target.value },
                          })
                        }
                      >
                        <option value="public">Public - Anyone can view your profile</option>
                        <option value="limited">Limited - Only employers can view your profile</option>
                        <option value="private">Private - Only visible to you</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show Earnings</Label>
                        <p className="text-sm text-muted-foreground">Display your earnings on your profile</p>
                      </div>
                      <Switch
                        checked={settings.privacy.showEarnings}
                        onCheckedChange={() => handleSwitchChange("privacy", "showEarnings")}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show Rating</Label>
                        <p className="text-sm text-muted-foreground">Display your rating on your profile</p>
                      </div>
                      <Switch
                        checked={settings.privacy.showRating}
                        onCheckedChange={() => handleSwitchChange("privacy", "showRating")}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSave} disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="payment" className="mt-6 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Manage your payment methods and preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="default-payment">Default Payment Method</Label>
                      <select
                        id="default-payment"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={settings.payment.defaultPaymentMethod}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            payment: { ...settings.payment, defaultPaymentMethod: e.target.value },
                          })
                        }
                      >
                        <option value="bank">Bank Account</option>
                        <option value="paypal">PayPal</option>
                        <option value="card">Credit Card</option>
                      </select>
                    </div>

                    <div className="rounded-md border p-4">
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-primary/10 p-2">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Bank Account</h3>
                          <p className="text-sm text-muted-foreground">{settings.payment.bankAccount}</p>
                        </div>
                        <Button variant="outline" size="sm" className="ml-auto">
                          Edit
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-md border p-4">
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-primary/10 p-2">
                          <DollarSign className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">PayPal</h3>
                          <p className="text-sm text-muted-foreground">{settings.payment.paypalEmail}</p>
                        </div>
                        <Button variant="outline" size="sm" className="ml-auto">
                          Edit
                        </Button>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Add New Payment Method
                    </Button>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSave} disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}

