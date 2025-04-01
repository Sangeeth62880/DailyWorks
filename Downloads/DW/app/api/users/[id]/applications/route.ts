import { type NextRequest, NextResponse } from "next/server"
import { getCollections } from "@/lib/db"
import { ObjectId } from "mongodb"
import { getServerAuthSession } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerAuthSession()

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = params.id

    // Validate ObjectId
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // Check if user is requesting their own applications
    if (session.user.id !== userId) {
      return NextResponse.json({ error: "You can only view your own applications" }, { status: 403 })
    }

    const { applications, jobs } = await getCollections()

    // Get all applications for the user
    const userApplications = await applications.find({ userId }).sort({ createdAt: -1 }).toArray()

    // Get job details for each application
    const applicationsWithJobs = await Promise.all(
      userApplications.map(async (application) => {
        const job = await jobs.findOne({ _id: new ObjectId(application.jobId).toString() })

        return {
          ...application,
          _id: application._id.toString(),
          job: job
            ? {
                ...job,
                _id: job._id.toString(),
              }
            : null,
        }
      }),
    )

    return NextResponse.json({
      applications: applicationsWithJobs,
    })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}

