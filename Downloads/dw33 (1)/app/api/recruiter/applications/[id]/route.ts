import { type NextRequest, NextResponse } from "next/server"
import { getCollections } from "@/lib/db"
import { ObjectId } from "mongodb"
import { getServerAuthSession } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerAuthSession()

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is a recruiter
    if (session.user.role !== "recruiter") {
      return NextResponse.json({ error: "Access denied. Recruiter role required." }, { status: 403 })
    }

    const applicationId = params.id
    const { status } = await request.json()

    // Validate status
    if (!["pending", "accepted", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
    }

    // Validate ObjectId
    if (!ObjectId.isValid(applicationId)) {
      return NextResponse.json({ error: "Invalid application ID" }, { status: 400 })
    }

    const { applications, jobs } = await getCollections()

    // Get the application
    const application = await applications.findOne({ _id: new ObjectId(applicationId) })

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // Verify the job belongs to the recruiter
    const job = await jobs.findOne({
      _id: new ObjectId(application.jobId),
      createdBy: session.user.id,
    })

    if (!job) {
      return NextResponse.json({ error: "You can only update applications for your own jobs" }, { status: 403 })
    }

    // Update application status
    const result = await applications.updateOne(
      { _id: new ObjectId(applicationId) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // If application is accepted, update the job status to assigned and set assignedTo
    if (status === "accepted") {
      await jobs.updateOne(
        { _id: new ObjectId(application.jobId) },
        {
          $set: {
            status: "assigned",
            assignedTo: application.userId,
            updatedAt: new Date(),
          },
        },
      )
    }

    return NextResponse.json({
      message: `Application ${status} successfully`,
    })
  } catch (error) {
    console.error("Error updating application status:", error)
    return NextResponse.json({ error: "Failed to update application status" }, { status: 500 })
  }
}

