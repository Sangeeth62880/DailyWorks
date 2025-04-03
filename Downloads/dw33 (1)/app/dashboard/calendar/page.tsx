"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Briefcase,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Home,
  MessageSquare,
  Settings,
  User,
} from "lucide-react"

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Mock job data for demonstration
  const scheduledJobs = [
    {
      id: "1",
      title: "Moving Assistant",
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 15),
      time: "9:00 AM - 5:00 PM",
      location: "Downtown",
      rate: 150,
    },
    {
      id: "2",
      title: "Event Staff",
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 22),
      time: "6:00 PM - 11:00 PM",
      location: "Music Hall",
      rate: 120,
    },
  ]

  // Calendar navigation functions
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)

    // Day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayIndex = firstDay.getDay()
    // Total days in the month
    const daysInMonth = lastDay.getDate()

    // Array to hold all calendar days
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const days = generateCalendarDays()
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Check if a day has scheduled jobs
  const getJobsForDay = (date) => {
    if (!date) return []
    return scheduledJobs.filter(
      (job) =>
        job.date.getDate() === date.getDate() &&
        job.date.getMonth() === date.getMonth() &&
        job.date.getFullYear() === date.getFullYear(),
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
            <Button variant="ghost" className="justify-start gap-2 bg-accent" asChild>
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
              <h1 className="text-3xl font-bold tracking-tight animate-fade-in">Calendar</h1>
              <p className="text-muted-foreground animate-fade-in-delayed">View and manage your scheduled jobs</p>
            </div>

            <Card className="mb-8 animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Select defaultValue={currentMonth.getMonth().toString()}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthNames.map((month, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Weekday headers */}
                  {weekDays.map((day, index) => (
                    <div key={index} className="text-center font-medium py-2">
                      {day}
                    </div>
                  ))}

                  {/* Calendar days */}
                  {days.map((day, index) => {
                    const jobsForDay = getJobsForDay(day)
                    const hasJobs = jobsForDay.length > 0

                    return (
                      <div
                        key={index}
                        className={`min-h-[100px] border rounded-md p-1 ${
                          !day ? "bg-muted/40" : hasJobs ? "bg-primary/10" : ""
                        }`}
                      >
                        {day && (
                          <>
                            <div className="text-right text-sm font-medium">{day.getDate()}</div>
                            <div className="mt-1">
                              {jobsForDay.map((job) => (
                                <div key={job.id} className="text-xs bg-primary/20 rounded p-1 mb-1 truncate">
                                  {job.title}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming scheduled jobs */}
            <div className="animate-fade-in-delayed">
              <h2 className="text-xl font-bold mb-4">Upcoming Jobs</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {scheduledJobs.map((job) => (
                  <Card key={job.id} className="transition-all hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold">{job.title}</h3>
                          <p className="text-sm text-muted-foreground">{job.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${job.rate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="h-4 w-4" />
                        <span>{job.date.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{job.time}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

