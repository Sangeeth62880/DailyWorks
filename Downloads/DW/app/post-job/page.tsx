"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarIcon, DollarSign } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { createJob } from "@/app/actions/job-actions"

export default function PostJobPage() {
  const router = useRouter()
  const [date, setDate] = useState<Date>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    requirements: "",
    location: "",
    date: null as Date | null,
    duration: "",
    rate: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setDate(date)
      setFormData((prev) => ({ ...prev, date }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Create FormData object
      const formDataObj = new FormData()
      formDataObj.append("title", formData.title)
      formDataObj.append("category", formData.category)
      formDataObj.append("description", formData.description)
      formDataObj.append("requirements", formData.requirements)
      formDataObj.append("location", formData.location)
      formDataObj.append("date", formData.date ? formData.date.toISOString() : "")
      formDataObj.append("duration", formData.duration)
      formDataObj.append("rate", formData.rate)

      const result = await createJob(formDataObj)

      if (result.error) {
        setError(result.error)
      } else {
        // Redirect to success page
        router.push("/post-job/success")
      }
    } catch (err) {
      setError("Failed to post job. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight animate-fade-in">Post a Job</h1>
            <p className="text-muted-foreground animate-fade-in-delayed">Find qualified workers for your one-day job</p>
          </div>

          <div className="mx-auto max-w-2xl">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
                <CardDescription>
                  Step {currentStep} of 3:{" "}
                  {currentStep === 1 ? "Basic Information" : currentStep === 2 ? "Job Details" : "Payment & Review"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Job Title</Label>
                        <Input
                          id="title"
                          name="title"
                          placeholder="e.g., Moving Assistant, House Cleaning"
                          required
                          value={formData.title}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => handleSelectChange("category", value)}
                        >
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cleaning">Cleaning</SelectItem>
                            <SelectItem value="delivery">Delivery</SelectItem>
                            <SelectItem value="moving">Moving</SelectItem>
                            <SelectItem value="gardening">Gardening</SelectItem>
                            <SelectItem value="handyman">Handyman</SelectItem>
                            <SelectItem value="photography">Photography</SelectItem>
                            <SelectItem value="event-staff">Event Staff</SelectItem>
                            <SelectItem value="office-help">Office Help</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Job Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          placeholder="Describe the job in detail..."
                          rows={4}
                          required
                          value={formData.description}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="requirements">Requirements</Label>
                        <Textarea
                          id="requirements"
                          name="requirements"
                          placeholder="List any specific requirements or qualifications..."
                          rows={4}
                          value={formData.requirements}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          name="location"
                          placeholder="e.g., Downtown, North Side"
                          required
                          value={formData.location}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PPP") : <span>Select a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={date} onSelect={handleDateChange} initialFocus />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration (hours)</Label>
                        <Input
                          id="duration"
                          name="duration"
                          type="number"
                          min="1"
                          max="24"
                          placeholder="e.g., 8"
                          required
                          value={formData.duration}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="rate">Payment Rate (total $)</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="rate"
                            name="rate"
                            type="number"
                            min="1"
                            placeholder="e.g., 150"
                            className="pl-9"
                            required
                            value={formData.rate}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="mt-6 space-y-4">
                        <h3 className="font-medium">Review Your Job Posting</h3>
                        <div className="rounded-lg border p-4 space-y-3">
                          <div>
                            <span className="font-medium">Title:</span> {formData.title}
                          </div>
                          <div>
                            <span className="font-medium">Category:</span> {formData.category}
                          </div>
                          <div>
                            <span className="font-medium">Location:</span> {formData.location}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span>{" "}
                            {formData.date ? format(formData.date, "PPP") : "Not selected"}
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span> {formData.duration} hours
                          </div>
                          <div>
                            <span className="font-medium">Payment:</span> ${formData.rate}
                          </div>
                          <div>
                            <span className="font-medium">Description:</span>
                            <p className="mt-1 text-sm text-muted-foreground">{formData.description}</p>
                          </div>
                          {formData.requirements && (
                            <div>
                              <span className="font-medium">Requirements:</span>
                              <p className="mt-1 text-sm text-muted-foreground">{formData.requirements}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                {currentStep > 1 ? (
                  <Button variant="outline" onClick={prevStep} disabled={isLoading}>
                    Previous
                  </Button>
                ) : (
                  <div></div>
                )}

                {currentStep < 3 ? (
                  <Button onClick={nextStep}>Next</Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? "Posting..." : "Post Job"}
                  </Button>
                )}
              </CardFooter>
            </Card>
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

