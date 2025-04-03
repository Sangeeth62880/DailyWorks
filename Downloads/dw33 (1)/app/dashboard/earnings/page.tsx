"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  Download,
  Home,
  MessageSquare,
  Settings,
  User,
} from "lucide-react"
import { format } from "date-fns"

export default function EarningsPage() {
  const [activeTab, setActiveTab] = useState("overview")

  // Mock earnings data
  const earningsData = {
    total: 1234.56,
    pending: 350.0,
    thisMonth: 650.0,
    lastMonth: 584.56,
    transactions: [
      {
        id: "tx1",
        jobTitle: "Moving Assistant",
        date: new Date(2025, 2, 15), // March 15, 2025
        amount: 150.0,
        status: "completed",
      },
      {
        id: "tx2",
        jobTitle: "Event Staff - Concert",
        date: new Date(2025, 2, 10), // March 10, 2025
        amount: 120.0,
        status: "completed",
      },
      {
        id: "tx3",
        jobTitle: "Office Help - Data Entry",
        date: new Date(2025, 2, 5), // March 5, 2025
        amount: 140.0,
        status: "completed",
      },
      {
        id: "tx4",
        jobTitle: "Gardening",
        date: new Date(2025, 1, 28), // February 28, 2025
        amount: 100.0,
        status: "completed",
      },
      {
        id: "tx5",
        jobTitle: "Delivery Assistant",
        date: new Date(2025, 1, 20), // February 20, 2025
        amount: 90.0,
        status: "completed",
      },
      {
        id: "tx6",
        jobTitle: "Photography - Event",
        date: new Date(2025, 3, 5), // April 5, 2025
        amount: 200.0,
        status: "pending",
      },
      {
        id: "tx7",
        jobTitle: "Handyman - Furniture Assembly",
        date: new Date(2025, 3, 10), // April 10, 2025
        amount: 150.0,
        status: "pending",
      },
    ],
  }

  // Filter transactions based on status
  const completedTransactions = earningsData.transactions.filter((tx) => tx.status === "completed")
  const pendingTransactions = earningsData.transactions.filter((tx) => tx.status === "pending")

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
            <Button variant="ghost" className="justify-start gap-2 bg-accent" asChild>
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
              <h1 className="text-3xl font-bold tracking-tight animate-fade-in">Earnings</h1>
              <p className="text-muted-foreground animate-fade-in-delayed">Track your income from completed jobs</p>
            </div>

            {/* Stats cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8 animate-fade-in">
              <Card className="transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${earningsData.total.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Lifetime earnings</p>
                </CardContent>
              </Card>
              <Card className="transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${earningsData.thisMonth.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    +${(earningsData.thisMonth - earningsData.lastMonth).toFixed(2)} from last month
                  </p>
                </CardContent>
              </Card>
              <Card className="transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${earningsData.pending.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">From {pendingTransactions.length} jobs</p>
                </CardContent>
              </Card>
              <Card className="transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Average Per Job</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${(earningsData.total / completedTransactions.length).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on {completedTransactions.length} completed jobs
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Earnings chart */}
            <Card className="mb-8 animate-fade-in">
              <CardHeader>
                <CardTitle>Earnings Overview</CardTitle>
                <CardDescription>Your earnings over the past 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border rounded-md">
                  <BarChart className="h-8 w-8 text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Earnings chart will appear here</span>
                </div>
              </CardContent>
            </Card>

            {/* Transactions */}
            <div className="animate-fade-in-delayed">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Transaction History</h2>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </Button>
              </div>

              <Tabs defaultValue="all" className="mb-8">
                <TabsList>
                  <TabsTrigger value="all">All Transactions</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-4">
                  <Card>
                    <CardContent className="p-0">
                      <div className="rounded-md border">
                        <div className="grid grid-cols-4 border-b bg-muted/50 p-4 text-sm font-medium">
                          <div>Job</div>
                          <div>Date</div>
                          <div>Amount</div>
                          <div>Status</div>
                        </div>
                        <div className="divide-y">
                          {earningsData.transactions.map((tx) => (
                            <div key={tx.id} className="grid grid-cols-4 p-4 text-sm">
                              <div className="font-medium">{tx.jobTitle}</div>
                              <div>{format(tx.date, "MMM d, yyyy")}</div>
                              <div>${tx.amount.toFixed(2)}</div>
                              <div>
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                    tx.status === "completed"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                  }`}
                                >
                                  {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="completed" className="mt-4">
                  <Card>
                    <CardContent className="p-0">
                      <div className="rounded-md border">
                        <div className="grid grid-cols-4 border-b bg-muted/50 p-4 text-sm font-medium">
                          <div>Job</div>
                          <div>Date</div>
                          <div>Amount</div>
                          <div>Status</div>
                        </div>
                        <div className="divide-y">
                          {completedTransactions.map((tx) => (
                            <div key={tx.id} className="grid grid-cols-4 p-4 text-sm">
                              <div className="font-medium">{tx.jobTitle}</div>
                              <div>{format(tx.date, "MMM d, yyyy")}</div>
                              <div>${tx.amount.toFixed(2)}</div>
                              <div>
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                  Completed
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="pending" className="mt-4">
                  <Card>
                    <CardContent className="p-0">
                      <div className="rounded-md border">
                        <div className="grid grid-cols-4 border-b bg-muted/50 p-4 text-sm font-medium">
                          <div>Job</div>
                          <div>Date</div>
                          <div>Amount</div>
                          <div>Status</div>
                        </div>
                        <div className="divide-y">
                          {pendingTransactions.map((tx) => (
                            <div key={tx.id} className="grid grid-cols-4 p-4 text-sm">
                              <div className="font-medium">{tx.jobTitle}</div>
                              <div>{format(tx.date, "MMM d, yyyy")}</div>
                              <div>${tx.amount.toFixed(2)}</div>
                              <div>
                                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                                  Pending
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

