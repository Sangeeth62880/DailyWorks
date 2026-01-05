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

    // Check if user is a recruiter
    if (session.user.role !== "recruiter") {
      return NextResponse.json({ error: "Access denied. Recruiter role required." }, { status: 403 })
    }

    const applicantId = params.id

    // Validate ObjectId
    if (!ObjectId.isValid(applicantId)) {
      return NextResponse.json({ error: "Invalid applicant ID" }, { status: 400 })
    }

    const { users, applications, jobs } = await getCollections()

    // Get applicant details
    const applicant = await users.findOne({ _id: new ObjectId(applicantId) }, { projection: { password: 0 } })

    if (!applicant) {
      return NextResponse.json({ error: "Applicant not found" }, { status: 404 })
    }

    // Get all jobs posted by the recruiter
    const recruiterJobs = await jobs.find({ createdBy: session.user.id }).toArray()
    const jobIds = recruiterJobs.map((job) => job._id.toString())

    // Get all applications from this applicant for the recruiter's jobs
    const applicantApplications = await applications
      .find({
        jobId: { $in: jobIds },
        userId: applicantId,
      })
      .sort({ createdAt: -1 })
      .toArray()

    // Get job details for each application
    const applicationsWithJobs = await Promise.all(
      applicantApplications.map(async (application) => {
        const job = await jobs.findOne({ _id: new ObjectId(application.jobId) })

        return {
          ...application,
          _id: application._id.toString(),
          job: job
            ? {
                _id: job._id.toString(),
                title: job.title,
                date: job.date,
                location: job.location,
                rate: job.rate,
              }
            : null,
        }
      }),
    )

    return NextResponse.json({
      applicant: {
        ...applicant,
        _id: applicant._id.toString(),
      },
      applications: applicationsWithJobs,
    })
  } catch (error) {
    console.error("Error fetching applicant details:", error)
    return NextResponse.json({ error: "Failed to fetch applicant details" }, { status: 500 })
  }
}

