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

    const { users } = await getCollections()
    const userId = params.id

    // Validate ObjectId
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // Check if user is requesting their own profile
    if (session.user.id !== userId) {
      // For security, limit what fields are returned for other users
      const user = await users.findOne(
        { _id: new ObjectId(userId) },
        {
          projection: {
            name: 1,
            image: 1,
            bio: 1,
            skills: 1,
            rating: 1,
            jobsCompleted: 1,
            createdAt: 1,
          },
        },
      )

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      return NextResponse.json({
        user: {
          ...user,
          _id: user._id.toString(),
        },
      })
    }

    // User is requesting their own profile, return all fields except password
    const user = await users.findOne({ _id: new ObjectId(userId) }, { projection: { password: 0 } })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        ...user,
        _id: user._id.toString(),
      },
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Check if user is updating their own profile
    if (session.user.id !== userId) {
      return NextResponse.json({ error: "You can only update your own profile" }, { status: 403 })
    }

    const { users } = await getCollections()
    const updateData = await request.json()

    // Validate required fields
    if (!updateData.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Remove fields that shouldn't be updated
    const { _id, email, password, role, createdAt, ...validUpdateData } = updateData

    // Add updatedAt timestamp
    validUpdateData.updatedAt = new Date()

    const result = await users.updateOne({ _id: new ObjectId(userId) }, { $set: validUpdateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}

