import { type NextRequest, NextResponse } from "next/server"
import { getCollections } from "@/lib/db"
import { ObjectId } from "mongodb"
import { getServerAuthSession } from "@/lib/auth"
import { OptionalId } from "mongodb";
import { Application } from "@/lib/db/models";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerAuthSession()

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { jobs, applications } = await getCollections()
    const jobId = params.id
    const userId = session.user.id
    const { message } = await request.json()

    // Validate ObjectId
    if (!ObjectId.isValid(jobId)) {
      return NextResponse.json({ error: "Invalid job ID" }, { status: 400 })
    }

    // Check if job exists
    const job = await jobs.findOne({ _id: new ObjectId(jobId).toString() })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Check if user has already applied
    const existingApplication = await applications.findOne({
      jobId: jobId,
      userId: userId,
    })

    if (existingApplication) {
      return NextResponse.json({ error: "You have already applied to this job" }, { status: 400 })
    }

    // Create application
    const application: OptionalId<Application> = {
      jobId: jobId,
      userId: userId,
      status: "pending",
      message: message || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await applications.insertOne(application)

    // Update job applicants
    await jobs.updateOne({ _id: new ObjectId(jobId).toString() }, { $push: { applicants: userId } })

    return NextResponse.json({
      application: { ...application, _id: result.insertedId },
      message: "Application submitted successfully",
    })
  } catch (error) {
    console.error("Error applying to job:", error)
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 })
  }
}

