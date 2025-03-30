import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, DollarSign, MapPin, Search } from "lucide-react"
import { getCollections } from "@/lib/db"

async function getJobs(searchParams: { [key: string]: string | string[] | undefined }) {
  try {
    const { jobs } = await getCollections()

    // Build query
    const query: any = { status: "open" }

    const category = searchParams.category as string
    if (category && category !== "all") {
      query.category = category
    }

    const search = searchParams.search as string
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ]
    }

    // Build sort
    const sortOptions: any = {}
    const sort = (searchParams.sort as string) || "date-desc"

    if (sort === "date-asc") {
      sortOptions.date = 1
    } else if (sort === "date-desc") {
      sortOptions.date = -1
    } else if (sort === "rate-asc") {
      sortOptions.rate = 1
    } else if (sort === "rate-desc") {
      sortOptions.rate = -1
    }

    // Execute query
    const jobsData = await jobs.find(query).sort(sortOptions).limit(12).toArray()

    return jobsData
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return []
  }
}

async function getCategories() {
  try {
    const { categories } = await getCollections()
    return await categories.find().toArray()
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const jobs = await getJobs(searchParams)
  const categories = await getCategories()

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
            <h1 className="text-3xl font-bold tracking-tight animate-fade-in">Find Jobs</h1>
            <p className="text-muted-foreground animate-fade-in-delayed">
              Browse through available one-day job opportunities
            </p>
          </div>

          {/* Search and filters */}
          <div className="mb-8 grid gap-4 md:grid-cols-4 animate-fade-in">
            <div className="relative md:col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search jobs..."
                className="w-full pl-8"
                defaultValue={(searchParams.search as string) || ""}
              />
            </div>
            <Select defaultValue={(searchParams.category as string) || "all"}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category._id.toString()} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select defaultValue={(searchParams.sort as string) || "date-desc"}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-asc">Date: Earliest first</SelectItem>
                <SelectItem value="date-desc">Date: Latest first</SelectItem>
                <SelectItem value="rate-asc">Rate: Low to high</SelectItem>
                <SelectItem value="rate-desc">Rate: High to low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Job listings */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <Card key={job._id.toString()} className="transition-all hover:shadow-md animate-fade-in">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold">{job.title}</h3>
                        <p className="text-sm text-muted-foreground flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {job.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${job.rate}</p>
                        <p className="text-xs text-muted-foreground">One day</p>
                      </div>
                    </div>
                    <p className="text-sm mb-4">
                      {job.description.length > 120 ? `${job.description.substring(0, 120)}...` : job.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                        {job.category}
                      </span>
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(job.date).toLocaleDateString()}
                      </span>
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                        <Clock className="h-3 w-3 mr-1" />
                        {job.duration} hrs
                      </span>
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                        <DollarSign className="h-3 w-3 mr-1" />${job.rate}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <Link href={`/jobs/${job._id.toString()}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/jobs/${job._id.toString()}/apply`}>
                        <Button size="sm">Apply Now</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <h3 className="text-lg font-medium">No jobs found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters to find more opportunities</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {jobs.length > 0 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                  1
                </Button>
                <Button variant="outline" size="sm">
                  2
                </Button>
                <Button variant="outline" size="sm">
                  3
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          )}
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

