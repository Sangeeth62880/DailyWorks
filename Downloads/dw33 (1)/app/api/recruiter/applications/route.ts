import { type NextRequest, NextResponse } from "next/server"
import { getCollections } from "@/lib/db"
import { ObjectId } from "mongodb"
import { getServerAuthSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerAuthSession()

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is a recruiter
    if (session.user.role !== "recruiter") {
      return NextResponse.json({ error: "Access denied. Recruiter role required." }, { status: 403 })
    }

    const { jobs, applications, users } = await getCollections()

    // Get all jobs posted by the recruiter
    const recruiterJobs = await jobs.find({ createdBy: session.user.id }).toArray()
    const jobIds = recruiterJobs.map((job) => job._id.toString())

    // Get all applications for the recruiter's jobs
    const applicationsData = await applications
      .find({ jobId: { $in: jobIds } })
      .sort({ createdAt: -1 })
      .toArray()

    // Get user details and job details for each application
    const applicationsWithDetails = await Promise.all(
      applicationsData.map(async (application) => {
        // Get applicant details
        const user = await users.findOne(
          { _id: new ObjectId(application.userId) },
          { projection: { name: 1, rating: 1, jobsCompleted: 1, image: 1 } },
        )

        // Get job details
        const job = await jobs.findOne(
          { _id: new ObjectId(application.jobId) },
          { projection: { title: 1, date: 1, location: 1, rate: 1 } },
        )

        return {
          ...application,
          _id: application._id.toString(),
          user: user
            ? {
                _id: user._id.toString(),
                name: user.name,
                rating: user.rating || 0,
                jobsCompleted: user.jobsCompleted || 0,
                image: user.image,
              }
            : { name: "Unknown User", rating: 0, jobsCompleted: 0 },
          job: job
            ? {
                _id: job._id.toString(),
                title: job.title,
                date: job.date,
                location: job.location,
                rate: job.rate,
              }
            : { title: "Unknown Job", date: new Date(), location: "Unknown", rate: 0 },
        }
      }),
    )

    return NextResponse.json({
      applications: applicationsWithDetails,
    })
  } catch (error) {
    console.error("Error fetching recruiter applications:", error)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}

