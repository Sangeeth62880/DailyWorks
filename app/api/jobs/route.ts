import { type NextRequest, NextResponse } from "next/server"
import { getCollections } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const sort = searchParams.get("sort") || "date-desc"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const { jobs } = await getCollections()

    // Build query
    const query: any = { status: "open" }

    if (category && category !== "all") {
      query.category = category
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ]
    }

    // Build sort
    const sortOptions: any = {}

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
    const jobsData = await jobs.find(query).sort(sortOptions).skip(skip).limit(limit).toArray()

    const total = await jobs.countDocuments(query)

    return NextResponse.json({
      jobs: jobsData,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { jobs } = await getCollections()
    const jobData = await request.json()

    // Validate required fields
    const requiredFields = ["title", "description", "location", "date", "duration", "rate", "category", "createdBy"]
    for (const field of requiredFields) {
      if (!jobData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Add additional fields
    const newJob = {
      ...jobData,
      status: "open",
      applicants: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await jobs.insertOne(newJob)

    return NextResponse.json({
      job: { ...newJob, _id: result.insertedId },
      message: "Job posted successfully",
    })
  } catch (error) {
    console.error("Error posting job:", error)
    return NextResponse.json({ error: "Failed to post job" }, { status: 500 })
  }
}

