import { type NextRequest, NextResponse } from "next/server"
import { getCollections } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { jobs, users } = await getCollections()
    const jobId = params.id

    // Validate ObjectId
    if (!ObjectId.isValid(jobId)) {
      return NextResponse.json({ error: "Invalid job ID" }, { status: 400 })
    }

    const job = await jobs.findOne({ _id: new ObjectId(jobId) })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Get creator info
    const creator = await users.findOne({ _id: new ObjectId(job.createdBy) }, { projection: { name: 1, rating: 1 } })

    return NextResponse.json({
      job: {
        ...job,
        createdBy: creator || { name: "Unknown User" },
      },
    })
  } catch (error) {
    console.error("Error fetching job:", error)
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { jobs } = await getCollections()
    const jobId = params.id
    const updateData = await request.json()

    // Validate ObjectId
    if (!ObjectId.isValid(jobId)) {
      return NextResponse.json({ error: "Invalid job ID" }, { status: 400 })
    }

    // Remove fields that shouldn't be updated
    const { _id, createdBy, createdAt, ...validUpdateData } = updateData

    // Add updatedAt timestamp
    validUpdateData.updatedAt = new Date()

    const result = await jobs.updateOne({ _id: new ObjectId(jobId) }, { $set: validUpdateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Job updated successfully",
    })
  } catch (error) {
    console.error("Error updating job:", error)
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { jobs } = await getCollections()
    const jobId = params.id

    // Validate ObjectId
    if (!ObjectId.isValid(jobId)) {
      return NextResponse.json({ error: "Invalid job ID" }, { status: 400 })
    }

    const result = await jobs.deleteOne({ _id: new ObjectId(jobId) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Job deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting job:", error)
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 })
  }
}

