import { type NextRequest, NextResponse } from "next/server"
import { getCollections } from "@/lib/db"
import { ObjectId } from "mongodb"
import { getServerAuthSession } from "@/lib/auth"
import { pusherServer } from "@/lib/pusher"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession()

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { messages, conversations } = await getCollections()
    const { conversationId, content, receiverId } = await request.json()

    if (!conversationId || !content || !receiverId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate ObjectIds
    if (!ObjectId.isValid(conversationId) || !ObjectId.isValid(receiverId)) {
      return NextResponse.json({ error: "Invalid IDs" }, { status: 400 })
    }

    // Check if conversation exists
    const conversation = await conversations.findOne({
      _id: new ObjectId(conversationId).toString(),
      participants: { $all: [session.user.id, receiverId] },
    })

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Create message
    const message = {
      conversationId,
      senderId: session.user.id,
      receiverId,
      content,
      read: false,
      createdAt: new Date(),
    }

    const result = await messages.insertOne(message)

    // Update conversation with last message
    await conversations.updateOne(
      { _id: new ObjectId(conversationId).toString() },
      {
        $set: {
          lastMessage: content,
          lastMessageDate: new Date(),
          updatedAt: new Date(),
        },
      },
    )

    // Trigger Pusher event
    await pusherServer.trigger(`private-conversation-${conversationId}`, "new-message", {
      ...message,
      _id: result.insertedId.toString(),
    })

    return NextResponse.json({
      message: { ...message, _id: result.insertedId.toString() },
    })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerAuthSession()

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversationId")

    if (!conversationId || !ObjectId.isValid(conversationId)) {
      return NextResponse.json({ error: "Invalid conversation ID" }, { status: 400 })
    }

    const { messages } = await getCollections()

    const messagesData = await messages.find({ conversationId }).sort({ createdAt: 1 }).toArray()

    // Mark messages as read
    await messages.updateMany(
      {
        conversationId,
        receiverId: session.user.id,
        read: false,
      },
      { $set: { read: true } },
    )

    return NextResponse.json({
      messages: messagesData.map((msg) => ({
        ...msg,
        _id: msg._id.toString(),
      })),
    })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

