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

    const { jobs } = await getCollections()

    // Get jobs posted by the user
    const postedJobs = await jobs.find({ createdBy: userId }).sort({ createdAt: -1 }).toArray()

    // Get jobs assigned to the user
    const assignedJobs = await jobs.find({ assignedTo: userId }).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({
      postedJobs: postedJobs.map((job) => ({
        ...job,
        _id: job._id.toString(),
      })),
      assignedJobs: assignedJobs.map((job) => ({
        ...job,
        _id: job._id.toString(),
      })),
    })
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
  }
}

