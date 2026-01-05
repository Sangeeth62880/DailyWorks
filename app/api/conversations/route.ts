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

    const { conversations, users } = await getCollections()

    // Get all conversations for the current user
    const conversationsData = await conversations
      .find({
        participants: session.user.id,
      })
      .sort({ updatedAt: -1 })
      .toArray()

    // Get user details for each conversation
    const conversationsWithUsers = await Promise.all(
      conversationsData.map(async (conversation) => {
        // Find the other participant (not the current user)
        const otherParticipantId = conversation.participants.find((id: string) => id !== session.user.id)

        // Get user details
        const otherUser = await users.findOne(
          { _id: new ObjectId(otherParticipantId) },
          { projection: { name: 1, image: 1 } },
        )

        return {
          ...conversation,
          _id: conversation._id.toString(),
          otherUser: otherUser || { name: "Unknown User" },
        }
      }),
    )

    return NextResponse.json({
      conversations: conversationsWithUsers,
    })
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession()

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { conversations } = await getCollections()
    const { participantId, jobId } = await request.json()

    if (!participantId) {
      return NextResponse.json({ error: "Missing participant ID" }, { status: 400 })
    }

    // Validate ObjectId
    if (!ObjectId.isValid(participantId)) {
      return NextResponse.json({ error: "Invalid participant ID" }, { status: 400 })
    }

    // Check if conversation already exists
    const existingConversation = await conversations.findOne({
      participants: { $all: [session.user.id, participantId] },
    })

    if (existingConversation) {
      return NextResponse.json({
        conversation: {
          ...existingConversation,
          _id: existingConversation._id.toString(),
        },
      })
    }

    // Create new conversation
    const newConversation = {
      participants: [session.user.id, participantId],
      jobId: jobId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await conversations.insertOne(newConversation)

    return NextResponse.json({
      conversation: {
        ...newConversation,
        _id: result.insertedId.toString(),
      },
    })
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
  }
}

